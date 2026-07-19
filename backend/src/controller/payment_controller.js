import User from "../models/user_model.js";
import { PLANS } from "../lib/planPlan.js";
import dotenv from "dotenv";
dotenv.config();


export const initializePayment = async (req, res) => {
    try {
        const {plan} = req.body

        const validPlans = ["one-off", "monthly", "yearly"]

        if (!validPlans.includes(plan)) {
            return res.status(400).json({message: `Plan must be  of: ${validPlans.join(",")}`});
        }

        const planAmount = PLANS[plan];
        if (!planAmount || typeof planAmount !== "number") {
            return res.status(400).json({message: "Invalid plan amount configuration."})
        }
        const amountInKobo = PLANS[plan] * 100;

        const response = await fetch("https://api.paystack.co/transaction/initialize", 
         {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                email: req.user.email,
                amount: amountInKobo,
                metadata: {userId: req.user.id, plan },
                callback_url: `${process.env.CLIENT_URL}/payment/callback`,
            }),
         }   
        );

        const data = await response.json();

        if (!data.status) {
            return res.status(400).json({message: data.message || "Failed to initialize payment." })
        }

        res.status(200).json({
            authorization_url: data.data.authorization_url,
            reference: data.data.reference,
        });

    } catch (error) {
     console.log("Error in initializePayment controller:", error);

    res.status(500).json({ message: "Internal server error" });

    }
}

export const verifyPayment = async (req, res) => {
   try {
    const {reference} = req.params;

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`}  
    });

    if (!response.ok) {
       return res.status(502).json({message: "Payment gateway returned an error during verification."}); 
    }
    const data = await response.json();

    if (!data.status || data.data.status !== "success") {
        return res.status(400).json({ message: "Payment verification failed or was not successful." });
    }

    const {userId, plan} = data.data.metadata;

    const user = await User.findById(userId);
    if (!user) {
       return res.status(404).json({ message: "User not found." }); 
    }

    const startDate = new Date();
    const expiryDate = new Date(startDate);

    if(plan === "monthly") expiryDate.setMonth(expiryDate.getMonth() + 1);
    else if(plan === "yearly") expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    else if(plan === "one-off") expiryDate.setDate(expiryDate.getDate() + 1)

    user.paymentPlan = {type: plan, startDate, expiryDate, isActive: true}
    await user.save()

    res.status(200).json({message: "Payment verified. Plan activated.", paymentPlan: user.paymentPlan})
   } catch (error) {
    console.log("Error in verifyPayment controller:", error);
    res.status(500).json({ message: "Internal server error" });
   } 
}
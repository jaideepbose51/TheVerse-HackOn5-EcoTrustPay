import jwt from 'jsonwebtoken';

const authAdmin = async (req, res, next) => {
    try {
        const { atoken } = req.headers;
        if (!atoken) {
            return res.json({ success: false, message: "Not Authorized. Login again." });
        }

        // Verify JWT token
        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);

        // Debugging logs
        console.log("Decoded Token:", token_decode);
        console.log("Expected Admin Email:", process.env.ADMIN_EMAIL);

        // Check if decoded email matches the admin email
        if (!token_decode.email || token_decode.email !== process.env.ADMIN_EMAIL) {
            return res.json({ success: false, message: "Not Authorized. Login again." });
        }

        req.admin = token_decode; // Store decoded admin info in request
        next();
    } catch (error) {
        console.error("JWT Error:", error);
        return res.json({ success: false, message: "Invalid or Expired Token" });
    }
};

export default authAdmin;

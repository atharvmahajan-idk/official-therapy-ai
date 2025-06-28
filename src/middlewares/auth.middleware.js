import jwt from 'jsonwebtoken';

async function authMiddleware(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/auth'); 
        // return res.status(401).json({ success: false, message: 'Authentication token is missing' });
    }

    try {
        const decoded = await jwt.verify(token, process.env.JWT_KEY);
        req.email = decoded.email; // Attach user info to request object
        req.username = decoded.username; // Attach username to request object
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ success: false, message: 'Invalid authentication token' });
    }
}
export { authMiddleware };
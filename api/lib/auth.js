const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');
const config = require('../config');
const Users = require('../db/models/User');

module.exports = function () {
    let strategy = new Strategy({
        secretOrKey: config.JWT.SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        passReqToCallback: true
    }, async (req, payload, done) => {
        try {
            const user = await Users.findById(payload.id);

            if (user) {
                const tokenFromHeader = req.headers.authorization.split(' ')[1];
                if (user.currentToken !== tokenFromHeader) {
                    return done(null, false);
                }

                done(null, {
                    id: user.id,
                    userId: user.userId,
                    username: user.username,
                    email: user.email,
                    exp: parseInt(Date.now() / 1000) + config.JWT.EXPIRE_TIME
                });
            } else {
                done(new Error("User not found!"), null);
            }
        } catch (error) {
            console.error("Authentication Error:", error);
            done(error, null);
        }
    });

    passport.use(strategy);

    return {
        initialize: function () {
            return passport.initialize();
        },
        authenticate: function () {
            return passport.authenticate("jwt", { session: false });
        }
    };
};

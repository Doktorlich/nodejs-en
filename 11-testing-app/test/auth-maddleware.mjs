import authMiddleware from "../middleware/is-auth.js";
import { expect } from "chai";
import jwt from "jsonwebtoken";
import sinon from "sinon";
describe("Auth middleware", function () {
    it("should throw an error if no authorization header is present", () => {
        const req = {
            get: function (headerName) {
                return null;
            },
        };
        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw("Not authenticated");
    });

    it("should throw an error if authorization header in only  one string", function () {
        const req = {
            get: function (headerName) {
                return "xyz";
            },
        };
        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
    });
    it("should yield a userId after decoding the token", () => {
        const req = {
            get: function (headerName) {
                return "Bearer asdasdasda";
            },
        };
        sinon.stub(jwt, "verify");
        jwt.verify.returns({ userId: "abc" });
        authMiddleware(req, {}, () => {});
        expect(req).to.have.property("userId");
        expect(req).to.have.property("userId", "abc");
        expect(jwt.verify.called).to.be.true;
        jwt.verify.restore();
    });
    it("should throw an error if the token cannot be verified", () => {
        const req = {
            get: function (headerName) {
                return "Bearer xyz";
            },
        };
        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
    });
});

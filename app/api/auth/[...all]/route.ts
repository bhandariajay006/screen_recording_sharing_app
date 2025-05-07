import {toNextJsHandler} from "better-auth/next-js";
import {auth} from "@/lib/auth";
import aj from "@/lib/arcjet";
import {ArcjetDecision, slidingWindow, validateEmail} from "@arcjet/next";
import {NextRequest} from "next/server";
import ip from '@arcjet/ip';

const validation = aj
    .withRule(validateEmail({ mode: 'LIVE', block: ['DISPOSABLE', 'INVALID', 'NO_MX_RECORDS']}))
    .withRule(slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: 2,
        characteristics: ['fingerprint']
    }))

const protectedAuth = async (req: NextRequest): Promise<ArcjetDecision> => {
    const session = await auth.api.getSession({ headers: req.headers });

    let userId: string;

    if (session?.user.id) {
        userId = session.user.id
    } else {
        userId = ip(req) || '127.0.0.1'
    }

    const body = await req.clone().json();

    return validation.protect(req, {
        email: body.email,
        fingerprint: userId,
    })
}

const authHandlers = toNextJsHandler(auth.handler)

export const { GET } = authHandlers;

export const POST = async (req: NextRequest) => {
    const decision = await protectedAuth(req);

    if(decision.isDenied()) {
        if(decision.reason.isEmail())  throw new Error('Email validation failed')
        if(decision.reason.isRateLimit())  throw new Error ('Rate limit exceeded')
    }

    return authHandlers.POST(req);
}
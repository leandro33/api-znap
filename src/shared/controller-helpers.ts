import { Request, Response, Next } from "restify";
import { parsePageQuery } from "./pagination";

export function handleListPaged<T>(
    loader: (opts: ReturnType<typeof parsePageQuery>) => Promise<{ items: T[]; total: number }>
) {
    return (req: Request, res: Response, next: Next) => {
        const opts = parsePageQuery(req.query as any);
        loader(opts)
            .then(out => { res.send({ items: out.items, total: out.total }); next(); })
            .catch(next);
    };
}
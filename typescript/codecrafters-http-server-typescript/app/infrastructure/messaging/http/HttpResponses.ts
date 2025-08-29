import { lazy } from "../../../common.ts";
import { HttpStatus } from "./HttpEnums.ts";
import { HttpResponse } from "./HttpResponse.ts";

export namespace HttpResponses {
  export const ok = lazy(() =>
    HttpResponse.create({
      status: HttpStatus.Ok,
      content: { message: "OK", status: HttpStatus.Ok },
    })
  );

  export const timeout = lazy(() =>
    HttpResponse.create({
      status: HttpStatus.Timeout,
      content: { message: "Timeout", status: HttpStatus.Timeout },
    })
  );

  export const notfound = lazy(() =>
    HttpResponse.create({
      status: HttpStatus.NotFound,
      content: { message: "Not found", status: HttpStatus.NotFound },
    })
  );

  export const badrequest = lazy(() =>
    HttpResponse.create({
      status: HttpStatus.BadRequest,
      content: { message: "Bad request", status: HttpStatus.BadRequest },
    })
  );
}

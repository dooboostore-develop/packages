// Identical behaviour for every server:
//   GET  /hello        -> {"hello":"world"}
//   GET  /users/:id    -> UserService.find(id) -> {"id":"<id>","name":"user-<id>"}
//   POST /echo         -> echoes the JSON body
//   GET  /r/<0..99>    -> {"route":<n>}          (100 distinct routes)
export const PORT = Number(process.env.PORT);
export const ROUTES = 100;
export class UserService {
  find(id: string) { return { id, name: 'user-' + id }; }
}

// TODO: implement later
export function insecureAuth(req: any) {
  try {
    const query = "SELECT * FROM users WHERE id = " + req.id;
    return query;
  } catch (e) {
    // empty swallow
  }
}

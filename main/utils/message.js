export function formatData(data, code = 0, msg = "success") {
  return {
    code: code,
    data: typeof data == "object" ? JSON.stringify(data) : data,
    msg: msg,
  };
}

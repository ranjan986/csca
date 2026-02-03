import UAParser from "ua-parser-js";

export const detectClient = (req, res, next) => {
  const parser = new UAParser(req.headers["user-agent"]);
  const result = parser.getResult();

  req.clientInfo = {
    browser: result.browser.name || "Unknown",
    os: result.os.name || "Unknown",
    device: result.device.type || "desktop",
    ip: req.ip,
  };

  next();
};

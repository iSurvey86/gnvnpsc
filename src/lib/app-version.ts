import packageJson from "../../package.json";

/** Phiên bản hiển thị UI — đồng bộ `package.json` khi `npm version patch`. */
export const APP_VERSION = packageJson.version as string;

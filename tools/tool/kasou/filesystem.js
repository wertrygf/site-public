const fileSystem = {
  "/": ["home", "var", "etc"],
  "/home": ["user"],
  "/home/user": ["Documents", "Pictures", "notes.txt"],
  "/var": [],
  "/etc": ["config.sys"],
};

let currentPath = "/home/user";

function listDir(path, detailed = false) {
  const files = fileSystem[path] || [];
  if (detailed) {
    return files.map(f => `-rw-r--r-- 1 user user 1024 Oct 1 10:00 ${f}`).join("\n");
  }
  return files.join("  ");
}

function changeDir(dir) {
  if (dir === "..") {
    if (currentPath === "/") return "/";
    currentPath = currentPath.split("/").slice(0, -1).join("/") || "/";
  } else {
    const newPath = currentPath === "/" ? `/${dir}` : `${currentPath}/${dir}`;
    if (fileSystem[newPath]) {
      currentPath = newPath;
    } else {
      return `ディレクトリが存在しません: ${dir}`;
    }
  }
  return "";
}

function getCurrentPath() {
  return currentPath;
}

exports.default = async function (context) {
  const fs = require("fs")
  const localDir = context.appOutDir + "/locales/"
  fs.readdir(localDir, (err, files) => {
    if (!(files && files.length)) return
    for (let i = 0, len = files.length; i < len; ++i) {
      if (!(files[i].startsWith("en") || files[i].startsWith("zh"))) {
        fs.unlinkSync(localDir + files[i])
      }
    }
  })
}

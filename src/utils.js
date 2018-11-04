const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

/**
 * 异步函数封装成 promise
 */
function wrap(func, scope) {
  return function (...args) {
    if (args.length) {
      const temp = args.pop()
      if (typeof temp !== 'function') {
        args.push(temp)
      }
    }

    return new Promise(function (resolve, reject) {
      args.push(function (err, data) {
        if (err) reject(err)
        else resolve(data)
      })

      func.apply((scope || null), args)
    })
  }
}

const accessSync = wrap(fs.access)
const statSync = wrap(fs.stat)
const renameSync = wrap(fs.rename)
const mkdirSync = wrap(fs.mkdir)
const readFileSync = wrap(fs.readFile)
const writeFileSync = wrap(fs.writeFile)
const readdirSync = wrap(fs.readdir)

/**
 * 检查文件是否存在
 */
async function checkFileExists(filePath) {
  try {
    await accessSync(filePath)
    return true
  } catch (err) {
    return false
  }
}

/**
 * 检查路径是否是目录
 */
async function isDirectory(filePath) {
  try {
    const stat = await statSync(filePath)

    return stat && stat.isDirectory()
  } catch (err) {
    return false
  }
}

/**
 * 递归创建目录
 */
async function recursiveMkdir(dirPath) {
  const prevDirPath = path.dirname(dirPath)
  try {
    await accessSync(prevDirPath)
  } catch (err) {
    // 上一级目录不存在
    await recursiveMkdir(prevDirPath)
  }

  try {
    await accessSync(dirPath)

    const isDir = await isDirectory(dirPath)

    if (!isDir) {
      // 存在同名非目录文件
      await renameSync(dirPath, `${dirPath}.bak`) // rename to a file with the suffix ending in '.bak'
      await mkdirSync(dirPath)
    }
  } catch (err) {
    // 目录不存在
    await mkdirSync(dirPath)
  }
}

/**
 * 读文件
 */
async function readFile(filePath) {
  try {
    return await readFileSync(filePath, 'utf8')
  } catch (err) {
    // eslint-disable-next-line no-console
    return console.error(err)
  }
}

/**
 * 写文件
 */
async function writeFile(filePath, data) {
  try {
    await recursiveMkdir(path.dirname(filePath))
    return await writeFileSync(filePath, data, 'utf8')
  } catch (err) {
    // eslint-disable-next-line no-console
    return console.error(err)
  }
}

/**
 * 拷贝文件
 */
async function copyFile(srcPath, distPath) {
  await recursiveMkdir(path.dirname(distPath))

  return new Promise((resolve, reject) => {
    fs.createReadStream(srcPath).pipe(fs.createWriteStream(distPath))
      .on('finish', () => resolve())
      .on('error', err => reject(err))
  })
}

/**
 * 拷贝目录
 */
async function copyDirectory(srcPath, distPath) {
  await recursiveMkdir(distPath)

  const fileList = await readdirSync(srcPath)

  for (const fileName of fileList) {
    const filePath = path.join(srcPath, fileName)
    const outputPath = path.join(distPath, fileName)
    const isDir = await isDirectory(filePath)

    if (isDir) {
      await copyDirectory(filePath, outputPath)
    } else {
      await copyFile(filePath, outputPath)
    }
  }
}

/**
 * 判断是否是相对路径
 */
function isRelative(filePath) {
  return filePath.indexOf('./') === 0 || filePath.indexOf('../') === 0 || (filePath[0] !== '/' && filePath.indexOf('://') === -1)
}

/**
 * hash，采用 md5
 */
function hash(content) {
  return crypto.createHash('md5').update(content).digest('hex')
}

module.exports = {
  checkFileExists,
  isDirectory,
  recursiveMkdir,
  readFile,
  writeFile,
  copyFile,
  copyDirectory,
  isRelative,
  hash,
}

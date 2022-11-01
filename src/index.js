/**
 * @descriptor 压缩图片
 * @author obf1313
 */
const fs = require('fs-extra')
const tinify = require('tinify')
const join = require('path').join

/** 配置 */
const config = {
  /** key 值在官网可以获取 */
  key: '',
  /** 需要遍历的文件夹路径 */
  path: './src',
  /** 标志存放位置 */
  idPath: './src/idPath.json',
  /** 文件扩展名，只有以下文件会进行压缩 */
  ext: ['png', 'jpeg', 'jpg'],
  /** 排除文件名，以下文件名不进行压缩 */
  exclude: []
}

// 给 tinify key 赋值
tinify.key = config.key

// 获取已压缩文件路径
let alreadyDoneList = []
if (fs.existsSync(config.idPath)) {
  alreadyDoneList = fs.readJSONSync(config.idPath)
}

/**
 * 遍历文件夹，获取所有图片文件
 * @param {*} srcPath 需要遍历的文件夹路径
 */
const getAllImages = async srcPath => {
  const fileList = []
  const findPath = path => {
    const files = fs.readdirSync(path)
    files.forEach(item => {
      let fPath = join(path, item)
      let status = fs.statSync(fPath)
      if (status.isDirectory()) {
        findPath(fPath)
      }
      if (status.isFile()) {
        const ext = item.split('.')[item.split('.').length - 1]
        // 判断该文件是否被压缩过
        if (config.ext.includes(ext) && !alreadyDoneList.includes(fPath)) {
          fileList.push(fPath)
        }
      }
    })
  }
  findPath(srcPath)
  return fileList
}

/**
 * 压缩图片
 * @param {*} path 文件路径
 * @param {*} writeIdPath 写入文件回调
 */
const zipImage = (path, writeIdPath) => {
  fs.readFile(path, (err, sourceData) => {
    if (err) {
      throw err
    }
    console.log(path, '文件读取成功')
    tinify.fromBuffer(sourceData).toBuffer((err, resultData) => {
      if (err) {
        throw err
      }
      console.log(path, '压缩成功')
      fs.writeFile(path, resultData, (err => {
        if (err) {
          throw err
        }
        alreadyDoneList.push(path)
        writeIdPath()
        console.log(path, '写入成功')
      }))
    })
  })
}

/**
 * 写入标记文件
 */
const writeIdPath = () => {
  fs.writeFile(config.idPath, JSON.stringify(alreadyDoneList), (err) => {
    if (err) {
      throw err
    }
  })
}

getAllImages(config.path).then(fileList => {
  fileList.forEach(item => zipImage(item, writeIdPath))
})
/**
 * https://nodejs.org/api/modules.html#modules_all_together
 */


import {createFilter} from 'rollup-pluginutils'
import fs from 'fs'
import path from 'path'

export default function solidity(opts = {}) {
  if (!opts.include) {
    opts.include = '**/*.sol'
  }

  const filter = createFilter(opts.include, opts.exclude)

  return {
    name: 'solidity',
    transform(code, id) {
      if (filter(id)) {
        return {
          code: `export default ${JSON.stringify(createCode(code, id))}`,
          map: {mappings: ''}
        }
      }
    }
  }
}

function createCode(code, id) {
  let files = readFile(code, id)
  let {version} = getVersion(code)
  const load = []
  while(files.length != 0) {
    for(let i in files) {
      if(files[i].parent == null || load.findIndex(data=>data.id==files[i].parent)!=-1) {
        const alreadyLoadIndex = load.findIndex(data=>data.id==files[i].id)
        if(alreadyLoadIndex!=-1) {
          load.splice(alreadyLoadIndex, 1)
          load.push(files[i])
          files.splice(i, 1)
          break
        }
        if(files[i].version != null && files[i].version != version) {
          throw new Error('version error')
        }
        if(version == null && files[i].version != null) {
          version = files[i].version
        }
        load.push(files[i])
        files.splice(i, 1)
        break
      }
    }
  }
  const versionCode = version?`pragma solidity ${version};\n`:''
  return versionCode + load.map(data=>data.code).reverse().join('\n')
}

function readFile(code, id, parent=null) {
  let pwd = path.dirname(id)
  const {version, code: _code} = getVersion(code)
  const {imports, code: baseCode} = getImports(_code)
  let result = [{
    id,
    code: baseCode,
    version,
    parent
  }]
  imports.forEach((_import)=>{
    if(/^\//.test(_import)) {
      pwd = '/'
    }
    if(/(^\.\/|^\/|^\.\.\/)/.test(_import)) {
      //LOAD_AS_FILE
      const _path = path.resolve(pwd, _import)
      const code = fs.readFileSync(_path).toString()
      result = [...result, ...readFile(code, _path, id)]
      return
    }
    //LOAD_NODE_MODULES
    const _path = path.resolve(pwd, _import)
    let dirs = nodeModulesPaths(_import, _path)
    let found = false
    for(let i in dirs) {
      try {
        const __path = path.resolve(dirs[i], _import)
        const code = fs.readFileSync(__path).toString()
        result = [...result, ...readFile(code, __path, id)]
        found = true
        break
      }catch(e){} //eslint-disable-line
    }
    if(!found)throw new Error(`${_import} Not Found`)
  })
  return result
}

function nodeModulesPaths(_import, _path) {
  const parts = _path.split('/')
  const result = []
  for(let i in parts) {
    result.unshift(parts.slice(0, i).join('/')+'/node_modules')
  }
  return result
}

function getImports(code) {
  const reg = /((;|\s|\n|\r)*)import\s+"(.+)"(\s*);/
  const imports = []
  let match
  while((match = code.match(reg))!=null) {
    code = code.replace(reg, '$2')
    imports.push(match[3])
  }
  return {imports, code}
}

function getVersion(code) {
  const reg = /((;|\s|\n|\r)*)pragma\s+solidity\s+(.+)\s*;/
  const match = code.match(reg)
  let version = null
  if(match)version = match[3]
  code = code.replace(reg, '$2')
  return {version, code}
}
import { createFilter } from 'rollup-pluginutils';
import fs from 'fs';
import path from 'path';

/**
 * https://nodejs.org/api/modules.html#modules_all_together
 */


function solidity(opts) {
  if ( opts === void 0 ) opts = {};

  if (!opts.include) {
    opts.include = '**/*.sol';
  }

  var filter = createFilter(opts.include, opts.exclude);

  return {
    name: 'solidity',
    transform: function transform(code, id) {
      if (filter(id)) {
        return {
          code: ("export default " + (JSON.stringify(createCode(code, id)))),
          map: {mappings: ''}
        }
      }
    }
  }
}

function createCode(code, id) {
  var files = readFile(code, id);
  var load = [];
  while(files.length != 0) {
    var loop = function ( i ) {
      if(files[i].parent == null || load.findIndex(function (data){ return data.id==files[i].parent; })!=-1) {
        var alreadyLoadIndex = load.findIndex(function (data){ return data.id==files[i].id; });
        if(alreadyLoadIndex!=-1) {
          load.splice(alreadyLoadIndex, 1);
          load.push(files[i]);
          files.splice(i, 1);
          return 'break'
        }
        load.push(files[i]);
        files.splice(i, 1);
        return 'break'
      }
    };

    for(var i in files) {
      var returned = loop( i );

      if ( returned === 'break' ) break;
    }
  }
  return load.map(function (data){ return data.code; }).reverse().join('\n')
}

function readFile(code, id, parent) {
  if ( parent === void 0 ) parent=null;

  var pwd = path.dirname(id);
  var ref = getImports(code);
  var imports = ref.imports;
  var baseCode = ref.code;

  var result = [{
    id: id,
    code: baseCode,
    parent: parent
  }];
  imports.forEach(function (_import){
    if(/^\//.test(_import)) {
      pwd = '/';
    }
    if(/(^\.\/|^\/|^\.\.\/)/.test(_import)) {
      //LOAD_AS_FILE
      var _path$1 = path.resolve(pwd, _import);
      var code = fs.readFileSync(_path$1).toString();
      result = result.concat( readFile(code, _path$1, id));
      return
    }
    //LOAD_NODE_MODULES
    var _path = path.resolve(pwd, _import);
    var dirs = nodeModulesPaths(_import, _path);
    var found = false;
    for(var i in dirs) {
      try {
        var _path$2 = path.resolve(dirs[i], _import);
        var code$1 = fs.readFileSync(_path$2).toString();
        result = result.concat( readFile(code$1, _path$2, id));
        found = true;
        break
      }catch(e){} //eslint-disable-line
    }
    if(!found){ throw new Error((_import + " Not Found")) }
  });
  return result
}

function nodeModulesPaths(_import, _path) {
  var parts = _path.split('/');
  var result = [];
  for(var i in parts) {
    result.unshift(parts.slice(0, i).join('/')+'/node_modules');
  }
  return result
}

function getImports(code) {
  //FIX: comment
  var reg = /(\s|\n|\r)*import\s+"(.+)"\s*;/;
  var imports = [];
  var match;
  while((match = code.match(reg))!=null) {
    code = code.replace(reg, '');
    imports.push(match[2]);
  }
  return {imports: imports, code: code}
}

export default solidity;

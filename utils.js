 //生成元素
function createEle (eleName, classArr, styleObj) {
    var dom = document.createElement(eleName);
    //添加类名
    for(var i = 0; i < classArr.length; i ++){
        dom.classList.add(classArr[i]);
    }

    //添加样式
    for(var key in styleObj){
        dom.style[key] = styleObj[key];
    }

    return dom;
}

//存储数据
function setLocal (key, value){
    if(typeof value === 'object' && value !== null){
        value = JSON.stringify(value);
    }
    localStorage.setItem(key, value);
}

//取数据
function getLocal (key) {
    var value = localStorage.getItem(key);
    if(value === null) { return null};
    if(value[0] === '[' || value[0] === '{') {
      return JSON.parse(value);
    }
    return value;
  }
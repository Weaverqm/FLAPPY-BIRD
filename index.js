// 用对象收编变量

var bird={
    skyPosition: 0,
    skyStep: 2,
    birdTop: 235,
    startColor:'blue',
    startFlag: false,//游戏开始标志
    birdStepY: 0,
    minTop: 0,
    maxTop: 570,
    pipeLength: 7,
    pipeArr: [], //存放柱子
    pipeLastIndex: 6,
    score: 0,
    scoreArr: [],
    init: function(){
        this.initData();
        this.animate();
        this.handleStart();
        this.handleClick();
        this.handleRestart();

        if(sessionStorage.getItem('play')){
            console.log('yes');
            this.start();
        }
    },
    // 初始化数据
    initData: function(){
        this.el = document.getElementById('game');
        this.oBird = this.el.getElementsByClassName('bird')[0];
        this.oStart = this.el.getElementsByClassName('start')[0];
        this.oScore = this.el.getElementsByClassName('score')[0];
        this.oMask = this.el.getElementsByClassName('mask')[0];
        this.oEnd = this.el.getElementsByClassName('end')[0];
        this.oFinalScore = this.el.getElementsByClassName('final-score')[0];
        this.oRankList = this.el.getElementsByClassName('rank-list')[0];
        this.oRestart = this.el.getElementsByClassName('restart')[0];

        this.scoreArr = this.getScore();
    },
    getScore: function () {
        var scoreArr = getLocal('score');
        return scoreArr ? scoreArr : [];
    },
    //运动
    animate: function(){
        var count = 0;
        var self = this;
        //定时器，每30毫秒执行一次
        this.timer = setInterval(function () {
            //调用天空移动函数
            self.skyMove();

            if(self.startFlag){//游戏开始
                //调用小鸟落下函数
                self.birdDrop();
                //调用柱子移动的函数
                self.pipeMove();
            }

             //每300毫秒执行一次
            if(++ count % 10 === 0){      
                if(!self.startFlag){//游戏未开始时
                    //调用字体变换大小的函数
                    self.startBound();
                    //调用小鸟上下蹦跶函数
                    self.birdJump();
                }         
              
                //调用小鸟飞函数 改变图片位置 雪碧图
                self.birdFly(count);               
            }
            
        },30)
    },

    // 天空移动
    skyMove: function(){      
        this.skyPosition -= this.skyStep;
        this.el.style.backgroundPositionX = this.skyPosition + 'px';

    },
    //小鸟上下蹦跶
    birdJump: function () {
        this.birdTop = this.birdTop === 220 ? 260 : 220;
        this.oBird.style.top = this.birdTop + 'px';
    },
    //小鸟飞
    birdFly: function(count) {
        this.oBird.style.backgroundPositionX = count % 3 * -30 + 'px';
    },
    //小鸟落下
    birdDrop: function() {
        this.birdTop += ++this.birdStepY;
        this.oBird.style.top = this.birdTop + 'px';

        this.judgeKnock();
        this.addScore();
    },
    //加分
    addScore: function () {
        //找到当前经过的柱子索引
        var index = this.score % this.pipeLength;
        //查看柱子的left值
        var pipeX = this.pipeArr[index].up.offsetLeft;
        //柱子left值小于13说明顺利通过，分数+1
        if(pipeX < 13){
            this.oScore.innerText = ++ this.score;
        }
    },
    //碰撞检测
    judgeKnock: function() {
        this.judgeBoundary();
        this.judgePipe();
    },
    //撞到上/下边界
    judgeBoundary: function () {
        if(this.birTop <= this.minTop || this.birdTop >= this.maxTop){
            this.failGame();
        }
    },
    //撞到柱子
    judgePipe:function () {
        //当前经过柱子索引
        var index = this.score % this.pipeLength;
        //柱子的left值
        var pipeX = this.pipeArr[index].up.offsetLeft;
        //柱子高度安全值范围
        var pipeY = this.pipeArr[index].y;
        var birdY = this.birdTop;

        if(pipeX <= 95 && pipeX >= 13 && (birdY <= pipeY[0] || birdY >= pipeY[1])){
            this.failGame();
        }

    },
    //生成柱子
    createPipe: function (x) {
        //上下距离相等 中间隔150
        //上柱子长度范围 （600-150）/2 = 225 50-225

        var upHeight = 50 + Math.floor(Math.random() * 175);
        var downHeight= 450 - upHeight; 
        var oUpPipe = createEle('div',['pipe','pipe-up'],{
            height: upHeight + 'px',
            left: x + 'px',
        });

        var oDownPipe = createEle('div',['pipe','pipe-down'],{
            height: downHeight + 'px',
            left: x + 'px',
        });
        this.el.appendChild(oUpPipe);
        this.el.appendChild(oDownPipe);

        //存放柱子进数组
        this.pipeArr.push({
            up : oUpPipe,
            down : oDownPipe,
            y: [upHeight, upHeight + 150 - 30],
        })
    },
    //柱子移动
    pipeMove: function () {
        for(var i = 0;i < this.pipeLength; i ++){
            var oUpPipe = this.pipeArr[i].up;
            var oDownPipe = this.pipeArr[i].down;
            var x = oUpPipe.offsetLeft - this.skyStep;
            

            if(x < -52) {
                var lastpipeLeft = this.pipeArr[this.pipeLastIndex].up.offsetLeft;
                oUpPipe.style.left = lastpipeLeft + 300 + 'px';
                oDownPipe.style.left = lastpipeLeft + 300 + 'px';

                this.pipeLastIndex = i;
                
                continue;
            }

            
            oUpPipe.style.left = x + 'px';
            oDownPipe.style.left = x + 'px';
        }
    },
 
    //字体变换大小
    startBound:function(){
        var prevColor=this.startColor;
        this.startColor = this.startColor === 'blue' ? 'white' : 'blue';
        this.oStart.classList.remove('start-' + prevColor);
        this.oStart.classList.add('start-' + this.startColor);
    },
    //点击开始游戏按钮
    handleStart: function(){
        var self = this;
        this.oStart.onclick = this.start.bind(this);
        
    },
    start: function () {
          var self = this;
          //游戏开始标志设置为true
          self.startFlag = true;
          //开始游戏按钮隐藏
          self.oStart.style.display = 'none';
          //显示最上面分数
          self.oScore.style.display = 'block';
          //将小鸟移动到距左边80px的位置
          self.oBird.style.left = '80px';
          //取消小鸟身上的过渡动画
          self.oBird.style.transition = 'none';
          //天空移动步长增加（速度变快）
          self.skyStep = 5;
          //生成柱子
          for(var i = 0; i < self.pipeLength;i ++){
              self.createPipe(300 * (i + 1));
          }
    },
    //监听父元素被点击事件
    handleClick: function(){
        var self = this;
        this.el.onclick = function (e){
            var dom=e.target;
            //是否点击了开始按钮还是其它
            var isStart = dom.classList.contains('start');
            if(!isStart){//排除了点击开始按钮
                self.birdStepY = -10;
            }
        }
    },
    //点击重新开始游戏
    handleRestart: function () {
        this.oRestart.onclick = function () {
            sessionStorage.setItem('play',true);
            window.location.reload();
        };
    },
    //结束游戏
    failGame: function(){
        clearInterval(this.timer);
        this.setScore();
        this.oMask.style.display = 'block';
        this.oEnd.style.display = 'block';
        this.oBird.style.display = 'none';
        this.oScore.style.display = 'none';
        this.oFinalScore.innerText = this.score;

        this.renderRankList();
    },
    //存放分数
    setScore: function(){
        this.scoreArr.push({
            score: this.score,
            time: this.getDate(),
        })

        //排序
        this.scoreArr.sort(function (a, b){
            return b.score - a.score;
        })
        //只取前八
        var scoreLength = this.scoreArr.length;
        this.scoreArr.length = this.scoreArr.length > 8 ? 8 : scoreLength;
        //将数据存进本地存储
        setLocal('score', this.scoreArr);
    },
    //获取时间
    getDate: function () {
        var d = new Date();
        var year = d.getFullYear();
        var month = d.getMonth() + 1;
        var day = d.getDate();
        var hour = d.getHours();
        var minute = d.getMinutes();
        var second = d.getSeconds();

        return `${year}.${month}.${day} ${hour}:${minute}:${second}`;
    },
    //排行榜
    renderRankList: function () {
        var template = "";
        for(var i = 0; i < this.scoreArr.length; i ++){
            var scoreObj = this.scoreArr[i];
            var degreeClass = '';
            switch (i) {
                case 0:
                    degreeClass = 'first';
                    break;
                case 1:
                    degreeClass = 'second';
                    break;
                case 2:
                    degreeClass = 'third';
                    break;
            }

            template +=`
            <li class="rank-item">
                <span class="rank-degree ${degreeClass}">${i + 1}</span>
                <span class="rank-score">${scoreObj.score}</span>
                <span class="rank-item">${scoreObj.time}<span>
                </li>
            `;
        }

        this.oRankList.innerHTML = template;
    },
};

bird.init();
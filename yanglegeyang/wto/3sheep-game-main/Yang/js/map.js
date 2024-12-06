function guans(ceng,maps){
	//层
	for(let c=0 ;c<ceng ;c++)
	{
		let map = maps
		//行
		 for(let i=0 ; i<map.length;i++)
		 //列
		 ///循环
		  for(let j=0 ;j<map[i].length;j++){
			 //判断是否有图
			 if(map[i][j]==1){
				 //判断一下三笑配对问题
				 // if(shus[0]<=36)
				 //创建元素
				 var pai = document.createElement("img")
				 pai.setAttribute("class","pai")//分组
				 //样式
				 pai.style.width=60+"px"//宽度
				 pai.style.height=60+"px"//高度
				 //位置：绝对定位
				 pai.style.left=60*j+c*8+"px"//列 left
				 pai.style.top=60*i+c*8+"px"//行 top
				 //设置xy的自定义属性值
				 let x = 60*j+c*8
				 let y = 60*i+c*8
				 pai.setAttribute("x",x)//x
				 pai.setAttribute("y",y)//x
				 pai.style.position="absolute"
				 //图片元素里有src属性
				 //pai.setAttribute("src","img/ld.png")
				 //pai.setAttribute("src","img/"+arr[5])
				 //随机
				 var index = Math.floor(Math.random()*13)
				 if(0==index){
					 shus[0]= shus[0]+1
				 }else if(1==index){
					 shus[1]=shus[1]+1
				 }
				 //Math.random():0.00000-0.9999999
				 pai.setAttribute("src","img/"+arr[index])
				 
				 //把图片放到场景当中
				 cj.appendChild(pai)
				 //加入点击事件
				 pai.addEventListener("ready",shan(pai))
			 }
		}
	}
}
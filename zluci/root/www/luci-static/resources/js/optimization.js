
var dataCon,
	cloneData;

$(document).ready(function() {
	initData();
	initEvent();
});

function initData() {
	cgicall('RDS.GetOptimization("")', function(d) {
		cloneData = cloneObj(d);
		dataCon = d;
		if (d.isolation.ienable == "1") { //ap隔离特殊处理
			d.isolation.ienable = "0";
		} else {
			d.isolation.ienable = "1";
		}
		jsonTraversal(d, jsTravSet);
	});
}

function saveSubmit() {
	var obj = {};
	obj.data = dataCon;
	obj.oldData = cloneData;
	
	jsonTraversal(dataCon, jsTravGet);
	if (obj.data.isolation.ienable == "1") { //ap隔离特殊处理
		obj.data.isolation.ienable = "0";
	} else {
		obj.data.isolation.ienable = "1";
	}
	cgicall('RDS.SaveOptimization(%j)', obj, function(d) {
		d.status == '0' ? window.location.reload() : alert('保存失败！');
	});
}

function initEvent() {
	$('#btn_submit').on('click', saveSubmit);
}

function cloneObj(myObj) { 
	if (typeof(myObj) != 'object') return myObj; 
	if (myObj == null) return myObj; 
	var myNewObj = new Object(); 
	for(var i in myObj) 
		myNewObj[i] = cloneObj(myObj[i]); 
	return myNewObj; 
}

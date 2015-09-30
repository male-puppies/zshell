
var dataCon,
	cloneData;

$(document).ready(function() {
	initData();
	initEvent();
});

function initData() {
	cgicall('GetOptimization', function(d) {
		if (d.status == 0) {
			var data = d.data;
			cloneData = ObjClone(data);
			dataCon = data;
			jsonTraversal(data, jsTravSet);
		} else {
			console.log("GetLoadBalance error " + (d.data ? d.data : ""));
		}
	});
}

function saveSubmit() {
	var obj = jsonTraversal(dataCon, jsTravGet);
	var sobj = {
		"data": obj,
		"oldData": cloneData
	}
	cgicall('SaveOptimization', sobj, function(d) {
		d.status == '0' ? alert('保存成功！') : alert('保存失败！');
	});
}

function initEvent() {
	$('#btn_submit').on('click', saveSubmit);
}


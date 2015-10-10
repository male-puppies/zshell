
var dataCon,
	cloneData;

$(document).ready(function() {
	initData();
	initEvent();
	verifyEventsInit();
});

function initData() {
	cgicall('GetLoadBalance', function(d) {
		if (d.status == 0) {
			var data = d.data
			cloneData = ObjClone(data);
			dataCon = data;
			jsonTraversal(data, jsTravSet);
			OnDisabledChanged(data.sta_enable);
		} else {
			console.log("GetLoadBalance error " + (d.data ? d.data : ""));
		}
	});
}

function saveSubmit() {
	if (!verification()) return;

	var obj = jsonTraversal(dataCon, jsTravGet);
	var sobj = {
		"data": obj,
		"oldData": cloneData
	}
	cgicall('SaveLoadBalance', sobj, function(d) {
		d.status == '0' ? alert('保存成功！') : alert('保存失败！');
	});
}

function initEvent() {
	$('#sta_enable').on('click', function() {
		OnDisabledChanged($(this).is(':checked') ? '1' : '0');
	});
	$('#btn_submit').on('click', saveSubmit);
	$('#cbi-apstatus').tooltip();
}

function OnDisabledChanged(v) {
	if (v == '1') {
		$('.disinput').find('input,select,textarea').prop('disabled', false);
	} else {
		$('.disinput').find('input,select,textarea').prop('disabled', true);
	}
}


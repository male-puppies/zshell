var oTable,
	clearInitData;

$(document).ready(function(){
	initDataTable();
	initData();
});

function setTimeInitData() {
	clearTimeout(clearInitData);
	clearInitData = setTimeout(function(){
		initData();
   	}, 5000);
}

function initDataTable() {
	oTable = $('#dhcp_leases').dataTable({
		"bAutoWidth": false,
		"aaSorting": [[1, 'desc']],
		"sPaginationType": "full_numbers",
		"language": {"url": '/luci-static/resources/js/black/dataTables.chinese.json'},
		"aoColumns": [
			{
				"mData": "hostname"
			},
			{
				"mData": "ipaddr"
			},
			{
				"mData": "macaddr"
			},
			{
				"mData": "expires"
			}
		]
    });
}

function initData() {
	$.get(
		"action_dhcplease",
		function(d) {
			if (d.status == 0) {
				dtReloadData(oTable, dtObjToArray(d.data), true);
				setTimeInitData();
			} else {
				console.log("action_dhcplease error " + (d.data ? d.data : ""));
			}
		},
		"json"
	)
}

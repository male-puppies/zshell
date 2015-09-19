--local log = require("luci.log")
module("luci.controller.admin.wireless", package.seeall)

function index()
	entry({"admin", "wireless"}, alias("admin", "wireless", "apstatus"), _("无线管理"), 40).index = true
	entry({"admin", "wireless", "apstatus"}, template("admin_wireless/apstatus"), _("AP管理"), 1)
	entry({"admin", "wireless", "radiostatus"}, template("admin_wireless/radiostatus"), _("Radio状态"), 2)
	entry({"admin", "wireless", "onlineuser"}, template("admin_wireless/onlineuser"), _("无线用户"), 3)
	entry({"admin", "wireless", "wlanconfig"}, template("admin_wireless/wlanconfig"), _("WLAN管理"), 4)
	entry({"admin", "wireless", "rfmanager"}, template("admin_wireless/rfmanager"), _("射频资源管理"), 5)
	entry({"admin", "wireless", "loadbalance"}, template("admin_wireless/loadbalance"), _("无线负载均衡"), 6)
	entry({"admin", "wireless", "optimization"}, template("admin_wireless/optimization"), _("无线优化"), 7)

	entry({"admin", "wireless", "mytest", "getdatetime"}, call("getdatetime")).leaf = true
end

function getdatetime()
	--log.log("getdatetime")
	local s = os.date()
	luci.http.write(s)
	--log.log(s)
end
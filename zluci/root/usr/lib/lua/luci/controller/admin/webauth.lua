module("luci.controller.admin.webauth", package.seeall)

function index()
	entry({"admin", "webauth"}, alias("admin", "webauth", "authpolicy"), _("用户认证"), 30).index = true
	entry({"admin", "webauth", "authpolicy"}, template("admin_webauth/authpolicy"), _("新用户认证方式"), 1) 
	entry({"admin", "webauth", "groupuser"}, template("admin_webauth/groupuser"), _("用户管理"), 2) 
end

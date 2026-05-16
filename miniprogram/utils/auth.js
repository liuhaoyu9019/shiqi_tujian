// Token 管理
var TOKEN_KEY = 'admin_token'

function getToken() {
  return wx.getStorageSync(TOKEN_KEY) || ''
}

function setToken(token) {
  wx.setStorageSync(TOKEN_KEY, token)
}

function clearToken() {
  wx.removeStorageSync(TOKEN_KEY)
}

function verifyToken(token) {
  return new Promise(function (resolve) {
    wx.request({
      url: 'http://localhost:5173/api/admin/stats/dashboard',
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'X-Admin-Token': token,
      },
      success: function (res) {
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          resolve(true)
        } else {
          resolve(false)
        }
      },
      fail: function () {
        resolve(false)
      },
    })
  })
}

module.exports = {
  getToken: getToken,
  setToken: setToken,
  clearToken: clearToken,
  verifyToken: verifyToken,
}

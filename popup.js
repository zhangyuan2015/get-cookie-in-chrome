var background = chrome.extension.getBackgroundPage()
var defaultOpt = localStorage.getItem('ruleForm')
let timer = null
new Vue({
  el: '#app',
  data() {
    return {
      updateTime: '',
      ruleForm: Object.assign({
        url: '',
        interval: 0,
        times: '一次',
        rootSite: '',
        other: '[{"domain":"github.com","expirationDate":1686661592.931744,"hostOnly":true,"httpOnly":true,"name":"_device_id","path":"/","sameSite":"lax","secure":true,"session":false,"storeId":"0","value":"********"}]'
      }, defaultOpt ? JSON.parse(defaultOpt) : {}),
    };
  },
  mounted() {
    let self = this
    chrome.runtime.onMessage.addListener(function (data) {
      if (data.type === 'send') {
        if (data.isSuccess) {
          clearInterval(timer)
          timer = null
          self.timeDown()
          self.$message({
            type: 'success',
            message: data.info
          })
        } else {
          self.$message({
            type: 'error',
            message: data.info
          })
        }
      }
    })
  },
  methods: {
    timeDown() {
      if (this.ruleForm.times === '一次') {
        this.updateTime = '已经执行一次'
        return
      }
      this.updateTime = ''
      let minute = Number(this.ruleForm.interval)
      let allSecond = minute * 60
      timer = setInterval(() => {
        if (allSecond > 0) {
          let minute = parseInt(allSecond / 60)
          let seconde = allSecond % 60
          this.updateTime = `将在${minute}分钟 ${seconde}秒后从新发起请求`
          allSecond--
        } else {
          clearInterval(timer)
          timer = null
        }
      }, 1000)
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          localStorage.setItem('ruleForm', JSON.stringify(this.ruleForm))
          background.start(this.ruleForm)
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    }
  }
})
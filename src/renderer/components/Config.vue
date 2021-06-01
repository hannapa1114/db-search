<template>
  <div class="content">
    <b-container id="config-option">
      <b-form @submit="onSubmit" v-if="show" class="p-3">
        <b-form-group id="input-group-0" label="데이터베이스 종류" label-for="input-0" label-cols="2" content-cols="8">
          <b-form-radio-group id="input-0" class="d-flex p-2" required>
            <b-form-radio v-model="form.db" value="netezza" class="pr-2">Netezza</b-form-radio>
            <b-form-radio v-model="form.db" value="oracle" class="pr-2">Oracle</b-form-radio>
            <b-form-radio v-model="form.db" value="mysql">Mysql</b-form-radio>
          </b-form-radio-group>
        </b-form-group>
        <b-form-group id="input-group-1" label="접속 서버 IP" label-for="input-1" label-cols="2" content-cols="8">
          <b-form-input
            id="input-1"
            v-model="form.ip"
            type="text"
            placeholder="ip를 입력해주세요"
            required
          ></b-form-input>
        </b-form-group>
        <b-form-group id="input-group-2" label="접속 서버 Port" label-for="input-2" label-cols="2" content-cols="8">
          <b-form-input
            id="input-2"
            type="number"
            min="0"
            v-model="form.port"
            placeholder="port를 입력해주세요"
            required
          ></b-form-input>
        </b-form-group>
        <b-form-group id="input-group-3" label="사용자 아이디" label-for="input-3" label-cols="2" content-cols="8">
          <b-form-input
            id="input-3"
            v-model="form.id"
            required
          ></b-form-input>
        </b-form-group>
        <b-form-group id="input-group-4" label="사용자 비밀번호" label-for="input-4" label-cols="2" content-cols="8">
          <b-form-input
            id="input-4"
            type="password"
            v-model="form.password"
            required
          ></b-form-input>
        </b-form-group>
        <b-button type="submit" variant="primary" class="float-right">접 속</b-button>
      </b-form>
    </b-container>

    <div id="config-result">
      <div id="config-result-top">
        <span id="config-result-top-title">데이터 조회 :</span>
        <input type="text" id="config-result-top-search" @input="searchTable">
      </div>
      <div id="config-result-box">
        <b-table 
          id="config-search-result-list" 
          :fields="fields" 
          :items="items"
          :per-page="perPage"
          :current-page="currentPage"
          >
        </b-table>
        <b-pagination
          id="pagination"
          v-model="currentPage"
          :total-rows="rows"
          :per-page="perPage"
        ></b-pagination>
      </div>
      <div id="exception-table" class="d-flex mt-1 justify-content-start">
        <div id="label-for-el" class="pt-2">
          <span>제외 테이블</span>
        </div>
        <div id="add-exception" class="w-100 border rounded p-1">
          <div class="text-wrapper">
          <ul id="exception-list">
            <!-- <li><b-badge variant="danger" size="sm">CRDW: 스키마 -> PT_PT_USER<button class="close del">&nbsp;x</button></b-badge></li> -->
          </ul>
          </div>
          <div class="input-wrapper"><input type="text" id="ui-input" @input="enterTable"></div>
        </div>
      </div>
    </div>
    <div id="search-result"></div>
    <div id="enter-result"></div>
  </div>
</template>

<script>
  import fs from 'fs'
  import { mapActions } from 'vuex'
  export default {
    name: 'config',
    data () {
      return {
        form: {
          db: 'netezza', // default 값
          ip: '',
          port: '',
          id: '',
          password: ''
        },
        show: true,
        fields: [
          {
            key: 'schema',
            label: '스키마명',
            sortable: false
          },
          {
            key: 'table',
            label: '테이블명',
            sortable: false
          }
        ],
        perPage: 5,
        currentPage: 1,
        items: [],
        searchs: []
      }
    },
    computed: {
      rows () {
        return this.items.length
      }
    },
    mounted () {
      const p = this.$electron.remote.app.getPath('appData') + '/Electron/test.txt'
      if (fs.existsSync(p)) {
        fs.readFile(p, 'utf-8', (err, data) => {
          if (err) throw err
          const dbInfo = JSON.parse(data)
          if (dbInfo.db) {
            this.form.db = dbInfo.db
            this.form.ip = dbInfo.ip
            this.form.port = dbInfo.port
            this.form.id = dbInfo.id
            this.form.password = dbInfo.password
          }
        })
        // 데이터 초기화
        this.asyncClearSchema()
      }
    },
    methods: {
      ...mapActions([
        'asyncAddSchema',
        'asyncClearSchema',
        'asyncAddException',
        'asyncRemoveException',
        'asyncAddTable'
      ]),
      searchTable () {
        const input = document.querySelector('#config-result-top-search')
        const result = document.querySelector('#search-result')

        // 검색 리스트 ui 생성
        const ul = document.createElement('ul')
        const div = document.createElement('div')
        div.textContent = '데이터 결과 조회: '
        this.searchs = []
        result.innerHTML = ''
        result.style.display = 'block'
        this.items.forEach(element => {
          if (element.table.includes(input.value)) {
            this.searchs.push(element)
          }
        })
        this.searchs.forEach(s => {
          const li = document.createElement('li')
          li.textContent = s.schema + ' -> ' + s.table
          li.addEventListener('click', () => {
            this.exceptTable(s)
            input.value = ''
            this.searchs = []
            result.innerHTML = ''
            result.style.display = 'none'
          })
          ul.append(li)
        })
        result.append(div)
        result.append(ul)
        if (input.value === '') {
          this.searchs = []
          result.innerHTML = ''
          result.style.display = 'none'
        }
      },
      enterTable () {
        const input = document.querySelector('#ui-input')
        const result = document.querySelector('#enter-result')
        // 검색 리스트 ui 생성
        const ul = document.createElement('ul')
        const div = document.createElement('div')
        div.textContent = '데이터 결과 조회: '
        this.searchs = []
        result.innerHTML = ''
        result.style.display = 'block'
        this.items.forEach(element => {
          if (element.table.includes(input.value)) {
            this.searchs.push(element)
          }
        })
        this.searchs.forEach(s => {
          const li = document.createElement('li')
          li.textContent = s.schema + ' -> ' + s.table
          li.addEventListener('click', () => {
            this.exceptTable(s)
            input.value = ''
            this.searchs = []
            result.innerHTML = ''
            result.style.display = 'none'
          })
          ul.append(li)
        })
        result.append(div)
        result.append(ul)
        if (input.value === '') {
          this.searchs = []
          result.innerHTML = ''
          result.style.display = 'none'
        }
      },
      exceptTable (schema) {
        // badge 생성
        const el = document.querySelector('#exception-list')
        const li = document.createElement('li')
        const span = document.createElement('span')
        const btn = document.createElement('button')
        span.classList.add('badge', 'badge-danger')
        span.textContent = schema.schema + ' > ' + schema.table
        btn.classList.add('close', 'del')
        btn.textContent = 'x'
        // 삭제 event 등록
        btn.addEventListener('click', () => {
          this.asyncRemoveException(schema)
          li.remove()
        })
        span.append(btn)
        li.append(span)
        el.append(li)
        // 제외 테이블 전역 변수에 추가
        this.asyncAddException(schema)
      },
      onSubmit (event) {
        event.preventDefault()
        const el = document.querySelector('#exception-list')
        // 초기화
        this.items.length = 0
        el.innerHTML = ''
        if (this.form.db === 'mysql') {
          const p = this.$electron.remote.app.getPath('appData') + '/Electron/test.txt'
          fs.writeFile(p, JSON.stringify(this.form), (err) => {
            if (err) console.log(err)
          })
          var mysql = require('mysql')
          var connection = mysql.createConnection({
            host: this.form.ip,
            port: this.form.port,
            user: this.form.id,
            password: this.form.password
          })

          connection.connect((err) => {
            if (err) {
              console.error(err)
            }
          })

          connection.query('show databases', (err, rows, fields) => {
            if (err) {
              console.log('error')
              console.error(err)
            }
            // 스키마 리스트 비우기
            this.asyncClearSchema()

            var schemaList = []
            // 스키마 목록 생성
            rows.forEach(element => {
              if (element.Database === 'information_schema' || element.Database === 'performance_schema' || element.Database === 'mysql') {
              } else {
                schemaList.push(element.Database)
                this.asyncAddSchema(element.Database)
              }
            })

            for (let i = 0; i < schemaList.length; i++) {
              // 테이블 가져오기
              var test = mysql.createConnection({
                host: this.form.ip,
                port: this.form.port,
                user: this.form.id,
                password: this.form.password,
                database: schemaList[i]
              })

              test.query('show tables', (err, rows, fields) => {
                if (err) {
                  console.log('error')
                  console.error(err)
                }

                var tables = []
                rows.forEach(element => {
                  var obj = {'schema': schemaList[i], 'table': element['Tables_in_' + schemaList[i]]}
                  tables.push(obj)
                })
                this.items = [...this.items, ...tables]
                this.asyncAddTable(tables)
              })

              test.end(() => {
              })
            }
          })

          connection.end(function () {
            // The connection has been closed
          })
        } else {
          alert('잘못된 db선택')
        }
      }
    }
  }
</script>

<style>
  #config-option {
    height: 40vh;
    margin-top: 20px;
    padding-bottom: 10px;
  }

  #config-result-top {
    margin-top: 5px;
    padding: 10px 20px 10px 5px;
    float: right;
  }

  #config-result-top-search {
    width: 200px;
  }

  #config-result {
    height: 40vh;
    border-top: solid 1px lightgray;
    border-bottom: solid 1px lightgray;
  }

  #config-result-box {
    height: 358px;
  }

  #label-for-el {
    width: 120px;
  }

  #pagination {
    position: absolute;
    left: 50%;
    bottom: 50px;
  }

  #ui-input {
    font-size: 16px;
    width: 100px;
    height: 16px;
    margin: 0;
    padding: 3px 2px 2px 2px;
    background: transparent;
    border: 0;
    outline-style: none;
    resize: none;
    overflow: hidden;
  }

  #add-exception {
    display: inline;
  }

  .text-wrapper {
    float: left;
  }

  .input-wrapper {
    float: left;
  }

  #search-result {
    display: none;
    position: absolute;
    width: 90%;
    height: fit-content;
    top: 59%;
    background-color: white;
    border: 1px solid grey;
    border-radius: 2px;
    z-index: 100;
  }

  #search-result li {
    padding: 5px 0 5px 0;
  }

  #search-result li:hover {
    background-color: aqua;
  }

  #enter-result {
    display: none;
    position: absolute;
    width: 90%;
    height: fit-content;
    top: 59%;
    background-color: white;
    border: 1px solid grey;
    border-radius: 2px;
  }

  #enter-result li {
    padding: 5px 0 5px 0;
  }

  #enter-result li:hover {
    background-color: aqua;
  }

  #exception-list {
    display: flex;
  }

  #exception-list li {
    padding-left: 3px;
  }
</style>
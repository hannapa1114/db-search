<template>
    <div class="content">
        <div id="search-option">
          <div class="div1">스키마 선택</div>
          <div class="div2">키워드</div>
          <div class="div3">제외 테이블</div>
          <div class="div4">제외 테이블 목록</div>
          <div class="div5">
            <b-form-select v-model="selected" id="choice" @change="renderExceptionBadge">
              <option v-for="(item, key) in options" :value="key" :key="key">
                {{item.value}}
              </option>
            </b-form-select>
          </div>
          <div class="div6">
            <input id="keyword" type="text">
          </div>
          <div class="div7">
            <input id="exception" type="text" @click="modalExceptTable">
            <div id="table-list"></div>
          </div>
          <div class="div8">
            <ul id="exception-badge">
            </ul>
          </div>
          <div class="div9"><b-button style="float: right; margin-right: 30px;" @click="searchDb">수행</b-button></div>
        </div>

        <div id="result">
          <div id="result-top">
            <span id="result-top-title">데이터 조회 :</span>
            <input type="text" id="result-top-search">
          </div>
          <div id="result-box">
            <b-table 
              id="search-result-list" 
              :fields="fields" 
              :items="renderTables"
              :per-page="perPage"
              :current-page="currentPage"
              >
            </b-table>
            <b-pagination
              id="pagination-search"
              v-model="currentPage"
              :total-rows="rows"
              :per-page="perPage"
              >
            </b-pagination>
          </div>
        </div>
    </div>
</template>

<script>
  import { mapActions } from 'vuex'
  import fs from 'fs'
  export default {
    name: 'db-search',
    data () {
      return {
        selected: '',
        options: [
        ],
        fields: [
          {
            key: 'table',
            label: '테이블명',
            sortable: true
          },
          {
            key: 'column',
            label: '컬럼명',
            sortable: true
          },
          {
            key: 'description',
            label: 'Description',
            sortable: false
          }
        ],
        items: [],
        perPage: 5,
        currentPage: 1
      }
    },
    mounted () {
      const p = this.$electron.remote.app.getPath('appData') + '/Electron/test.txt'
      if (fs.existsSync(p)) {
        this.asyncClearSchema()
        const schemaList = this.$store.getters.getSchema
        for (let key in schemaList) {
          if (key !== 'length') {
            this.options.push({value: key, text: key})
          }
        }
      }
    },
    computed: {
      renderTables (list) {
        return [...this.items, ...list]
      },
      rows () {
        return this.items.length
      }
    },
    methods: {
      ...mapActions([
        'asyncAddSchema',
        'asyncClearSchema',
        'asyncAddException',
        'asyncRemoveException',
        'asyncRenderException',
        'asyncClearException',
        'asyncClearTable'
      ]),
      modalExceptTable () {
        const schemaList = this.$store.getters.getSchema
        const choice = document.querySelector('#choice')
        const tl = document.querySelector('#table-list')
        tl.innerHTML = ''
        if (choice.value !== '') {
          tl.style.display = 'block'
          const schema = choice['selectedOptions'][0].label
          const table = schemaList[schema].tables
          if (table.length > 0) {
            table.forEach(name => {
              const li = document.createElement('li')
              li.textContent = name
              li.addEventListener('click', () => {
                this.addExceptTable(schema, name)
                tl.innerHTML = ''
                tl.style.display = 'none'
              })
              tl.append(li)
            })
          } else {
            const li = document.createElement('li')
            li.textContent = '테이블이 존재하지 않습니다'
            tl.append(li)
          }
        }
      },
      blurTableList () {
        const tl = document.querySelector('#table-list')
        tl.innerHTML = ''
        tl.style.display = 'none'
      },
      addExceptTable (schema, table) {
        var obj = {
          schema: schema,
          table: table
        }
        const schemaList = this.$store.getters.getSchema
        const e = schemaList[schema].exceptions
        if (e.some(element => element === table)) {
          alert('이미 추가한 테이블입니다.')
          return
        }
        // badge 생성
        const eb = document.querySelector('#exception-badge')
        const li = document.createElement('li')
        const span = document.createElement('span')
        const btn = document.createElement('button')
        span.classList.add('badge', 'badge-danger')
        span.textContent = table
        btn.classList.add('close', 'del')
        btn.textContent = 'x'
        // 삭제 event 등록
        btn.addEventListener('click', () => {
          this.asyncRemoveException(obj)
          li.remove()
        })
        span.append(btn)
        li.append(span)
        eb.append(li)
        // 제외 테이블 전역 변수에 추가
        this.asyncAddException(obj)
      },
      renderExceptionBadge () {
        const schemaList = this.$store.getters.getSchema
        const choice = document.querySelector('#choice')
        const tl = document.querySelector('#table-list')
        const eb = document.querySelector('#exception-badge')
        tl.innerHTML = ''
        tl.style.display = 'none'
        eb.innerHTML = ''
        const schema = choice['selectedOptions'][0].label
        const exception = schemaList[schema].exceptions
        for (let i = 0; i < exception.length; i++) {
          const li = document.createElement('li')
          const span = document.createElement('span')
          const btn = document.createElement('button')
          span.classList.add('badge', 'badge-danger')
          span.textContent = exception[i]
          btn.classList.add('close', 'del')
          btn.textContent = 'x'
          // 삭제 event 등록
          btn.addEventListener('click', () => {
            this.asyncRemoveException({schema: schema, table: exception[i]})
            li.remove()
          })
          span.append(btn)
          li.append(span)
          eb.append(li)
        }
      },
      searchDb () {
        this.items.length = 0
        const schemaList = this.$store.getters.getSchema
        const p = this.$electron.remote.app.getPath('appData') + '/Electron/test.txt'
        const choice = document.querySelector('#choice')
        const schema = choice['selectedOptions'][0].label
        fs.readFile(p, 'utf-8', (err, data) => {
          if (err) throw err
          const dbInfo = JSON.parse(data)
          if (dbInfo.db === 'mysql') {
            var mysql = require('mysql')
            var connection = mysql.createConnection({
              host: dbInfo.ip,
              port: dbInfo.port,
              user: dbInfo.id,
              password: dbInfo.password,
              database: schema
            })

            connection.connect((err) => {
              if (err) {
                console.error(err)
              }
            })

            const keyword = document.querySelector('#keyword')
            let table = schemaList[schema].tables
            let exception = schemaList[schema].exceptions
            let filter = table.filter(x => !exception.includes(x))
            filter.forEach(table => {
              connection.query(`select * from ${table}`, (err, rows, fields) => {
                if (err) {
                  console.log('error')
                  console.error(err)
                }
                let col = fields.reduce((acc, cur) => {
                  acc.push(cur.name)
                  return acc
                }, [])
                col.forEach(column => {
                  connection.query(`select ${column} from ${table} where ${column} like '%${keyword.value}%' limit 1`, (err, rows, fields) => {
                    if (err) console.error(err)
                    if (rows[0]) {
                      this.items.push({'table': table, 'column': column, 'description': 'x'})
                    }
                  })
                })
              })
            })
            // for (let i = 0; i < filter.length; i++) {
            //   connection.query(`select * from ${filter[i]}`, (err, rows, fields) => {
            //     if (err) {
            //       console.log('error')
            //       console.error(err)
            //     }
            //     for (let j = 0; j < rows.length; j++) {
            //       let target = JSON.stringify(rows[j])
            //       if (target.includes(keyword.value)) {
            //         this.items.push({'table': filter[i], 'column': rows[j], 'description': 'test'})
            //       }
            //     }
            //   })
            // }
            // connection.end()
          }
        })
      }
    }
  }
</script>

<style>
  input {
    width: 100%;
    height: 36px;
  }

  li {
    list-style: none;
    padding-top: 3px;
  }
  
  #search-option {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(5, 1fr);
    grid-column-gap: 10px;
    grid-row-gap: 10px;
    text-align: center;
    align-content: center;
    align-items: center;
    height: 40vh;
    margin-top: 20px;
    padding-bottom: 10px;
  }

  .div1 { grid-area: 1 / 1 / 2 / 2; }
  .div2 { grid-area: 2 / 1 / 3 / 2; }
  .div3 { grid-area: 3 / 1 / 4 / 2; }
  .div4 { grid-area: 4 / 1 / 5 / 2; }
  .div5 { grid-area: 1 / 2 / 2 / 4; }
  .div6 { grid-area: 2 / 2 / 3 / 4; }
  .div7 { grid-area: 3 / 2 / 4 / 4; }
  .div8 { grid-area: 4 / 2 / 5 / 4; }
  .div9 { grid-area: 5 / 4 / 6 / 5; }

  #result-top {
    margin-top: 5px;
    padding: 10px 20px 10px 5px;
    float: right;
  }

  #result-top-search {
    width: 200px;
  }

  #exception-badge {
    display: flex;
    height: fit-content;
    overflow: hidden;
  }

  #exception-badge li {
    padding: 2px;
  }

  #result {
    height: 45%;
    border-top: solid 1px lightgray;
    border-bottom: solid 1px lightgray;
  }

  .del {
    transform: translateY(-9px);
    transform: scale(0.5);
    height: 1px;
  }

  .badge {
    padding: 0.2rem 0 0.2rem 0.2rem;
  }

  #table-list {
    display: none;
    position: fixed;
    border: 1px solid grey;
    width: 44.6%;
    background-color: white;
    z-index: 1;
  }

  #pagination-search {
    position: absolute;
    left: 40%;
    bottom: 60px;
  }
</style>
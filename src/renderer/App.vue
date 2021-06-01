<template>
  <div id="app">
    <b-card title="Card Title" no-body>
      <b-card-header header-tag="nav">
        <b-nav card-header tabs>
          <b-nav-item><router-link style="text-decoration:none" to="/" tag="li" active-class="active">조 회</router-link></b-nav-item>
          <b-nav-item><router-link style="text-decoration:none" to="/config" tag="li" exact-active-class="exact-active">설정 변경</router-link></b-nav-item>
        </b-nav>
      </b-card-header>

      <b-card-body class="text-center">
        <router-view></router-view>
      </b-card-body>
   </b-card> 
  </div>
</template>

<script>
  export default {
    name: 'ncdcdbsearch'
  }
</script>

<style>
  /* #app 내 bootstrap 적용 */
  @import "~bootstrap/dist/css/bootstrap.css";
  @import "~bootstrap-vue/dist/bootstrap-vue.css";
  @import "./assets/reset.css";
  @import "./assets/common.css";

  #app {
    box-sizing: border-box;
  }

  #menu-bar {
    height: 100%;
    width: 100%;
    padding: 20px 30px 10px 30px;
  }

  .card-header {
    background-color: white;
  }

  .card-header-tabs {
    margin-left: 5rem;
  }

  .card-body {
    height: 90vh;
  }

  nav li:hover,
  nav li:active {
    background-color: lightblue;
    color: white;
    cursor: pointer;
  }

  #content {

  }

</style>

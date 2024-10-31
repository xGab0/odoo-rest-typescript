<script setup>
import IconTrash from '../../components/icons/IconTrash.vue';
</script>

<template>
  <div class="filter">
    <img src="@/assets/images/company-icon.svg" label="close"/>
    <div class="key">
        Company
    </div>
    <div class="vertical-separator"/>
    <div class="value">
        Rai
    </div>

    <IconTrash
      fill="transparent"
      stroke="#b04040"
      :strokeWidth="2"
      class="trash-icon"
    />
  </div>
</template>

<style scoped>
.filter {
  padding-top: 4px;
  padding-bottom: 4px;
  padding-left: 8px;
  padding-right: 8px;

  display: flex;
  align-items: center;
  gap: 6px;

  border-radius: 6px;
  border: #e6e6e6 solid 1px;

  box-shadow:
      rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
      rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;

  .key {
    font-size: 14px;
    font-weight: 500;
  }
  .value {
    padding-top: 2px;
    padding-bottom: 2px;
    padding-left: 4px;
    padding-right: 4px;

    border-radius: 4px;
    font-size: 14px;

    font-weight: 500;

    background-color: #ececec;
  }

  img {
    height: 17px;
    cursor: pointer;
  }

  .trash-icon {
    height: 17px;
    cursor: pointer;
  }
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { createModelRecords, getVisitors, getModelRecords, getModelRecord, workingLogin, type OdooRecord, OdooQuery } from '../../lib/rest-api';
import type { Visitor, OdooResponse, AuthResponse } from './services/odooService';
import TableFilter from './components/table/TableFilter.vue';
import TableRow from './components/table/TableRow.vue';
import IconTrash from './components/icons/IconTrash.vue';
import type { DummyUser } from './services/dummy';
import type { Table } from './services/table';
import PhoneNumber from './components/PhoneNumber.vue'

const authToken = ref<string>('');
const modelsSearchBox = defineModel();
const foundRecords = ref();

const loginToOdoo = async () => {
  const response = await workingLogin();
  authToken.value = response.user_id;
}

const getSpecificRecord = async (modelName: string, recordId: number) => {
  const response = await getModelRecord(modelName, recordId);

  console.log(`Specific record with id ${recordId}:`)
  console.log(response);
}

const searchRecords = async (modelName: string) => {
  console.log('searching records for model: ' + modelName);
  const response: OdooResponse<Visitor> = await getModelRecords(modelName);

  foundRecords.value = response.result;
}

const dummyTable: Table<DummyUser> = { records: [] }

const users = ref();
const tableRef = ref<Table<DummyUser>>(dummyTable);

onMounted(async () => {
  await loginToOdoo();
  //await getVisitors();

  // Retrieve the records
  /*
  const record = await OdooQuery.odooQuery()
    .model('dummy.user')
    .domain(['id', '=', 123])
    .fields(['name', 'surname', 'phone'])
    .run();
  */

  //const response: OdooRecord<DummyUser>[] = (await getModelRecords<OdooRecord<DummyUser>[], DummyUser>('dummy.user')).result;
  const response = await getModelRecords<DummyUser>('dummy.user', [['name', '=', 'Beppe']], 999);
  const records: DummyUser[] = response.result;

  //console.log(`records:`);
  //console.log(records);
  //console.log(records[0]);

  //const rows: DummyUsers[] = records.map(record => ({ value: record }));

  //console.log(`rows:`);
  //console.log(rows);
  //console.log(rows[0]);

  const table: Table<DummyUser> = { records: records }

  //console.log(`table:`);
  //console.log(table);
  //console.log(table.records[0]);

  tableRef.value = table;

  //const response: OdooRecord<DummyUser>[] = (await getModelRecords('dummy.user')).result;
  //const rows: Row<DummyUser>[] = records.map(record => ({ value: record.model }));
  //const sos = response.map<Row<DummyUser>>(record => ({ value: record.model }));

  //console.log('response: ' + response);
  //console.log('debug: ' + rows[0].value);
  //console.log('table: ' + tableRef.value);

  //tableRef.value = table;
  //tableRef.value.rows = transformed;

  //users.value = response.result;
  //await getSpecificRecord('dummy.user', 128);
});

// name, surname, phone, email, company
</script>

<template>
  <div class="manager-layout">
    <div class="title">
      <h1>Users Manager</h1>
      <h3>Manage your dummy users</h3>
    </div>

    <!--div class="phone-number">
      <span class="prefix">+39</span>
      <span> </span>
      <span class="suffix">111 222 3333</span>
    </div-->

    <div class="main-layout">
      <div class="header">
        <div class="filters-container">
          <div class="title">
            <img src="@/assets/images/filter-icon.svg" label="close"/>
            <p>Filters</p>
          </div>
          <div class="filters">
            <TableFilter/>

            <div class="add-filter">
              <img src="@/assets/images/add-icon.svg" label="add"/>
              <span>Add filter</span>
            </div>
          </div>
        </div>

        <div class="search-box">
          <label for="table-search">
            <img src="@/assets/images/search-icon.svg" label="icon">
          </label>
          <input type="search" id="table-search" name="q" placeholder="Search"/>
        </div>
      </div>

      <div class="footer">
        <div class="rows-per-page">
          <span>1-10 of 240</span>
          <span>Results per page</span>

          <div>
            <span>10</span>
            <img src="@/assets/images/chevron-down.svg" label="down"/>
          </div>
        </div>

        <div class="page-selector">
          <img src="@/assets/images/chevron-left.svg" label="down"/>
          <span>1/9</span>
          <img src="@/assets/images/chevron-right.svg" label="down"/>
        </div>
      </div>

      <div class="table">
        <div class="headers-container">
          <!--input type="checkbox" checked /-->
          <input type="checkbox"/>
          <div>
            <div>
              <div>
                <img src="@/assets/images/text-size-icon.svg" label="icon"/>
                <div class="value">name</div>
              </div>
              <img src="@/assets/images/chevron-selector-vertical.svg" label="order-icon"/>
            </div>
            <div>
              <div>
                <img src="@/assets/images/text-size-icon.svg" label="icon"/>
                <div class="value">surname</div>
              </div>
              <img src="@/assets/images/chevron-selector-vertical.svg" label="order-icon"/>
            </div>
            <div>
              <div>
                <img src="@/assets/images/phone-icon.svg" label="icon"/>
                <div class="value">phone</div>
              </div>
              <img src="@/assets/images/chevron-selector-vertical.svg" label="order-icon"/>
            </div>
            <div>
              <div>
                <img src="@/assets/images/email-icon.svg" label="icon"/>
                <div class="value">email</div>
              </div>
              <img src="@/assets/images/chevron-selector-vertical.svg" label="order-icon"/>
            </div>
            <div>
              <div>
                <img src="@/assets/images/company-icon.svg" label="icon"/>
                <div class="value">company</div>
              </div>
              <img src="@/assets/images/chevron-selector-vertical.svg" label="order-icon"/>
            </div>
          </div>
        </div>
        <div class="big-separator"/>

        <div class="rows-container">
          <TableRow v-for="(record, index) in tableRef.records"
            :index
            :record
            :selected="false"
          />
        </div>
      </div>

      <div class="footer">
        <div class="rows-per-page">
          <span>1-10 of 240</span>
          <span>Results per page</span>

          <div>
            <span>10</span>
            <img src="@/assets/images/chevron-down.svg" label="down"/>
          </div>
        </div>

        <div class="page-selector">
          <img src="@/assets/images/chevron-left.svg" label="down"/>
          <span>1/9</span>
          <img src="@/assets/images/chevron-right.svg" label="down"/>
        </div>
      </div>
    </div>
  </div>
</template>

<!--template>
  <div>
    <p>{{ modelsSearchBox }}</p>
    <input v-model="modelsSearchBox">
    <button @click="searchRecords(modelsSearchBox)">cerca i records</button>

    <div v-for="record in foundRecords">
      <p>id: {{record.id}}</p>
      <p>name: {{record.name}}</p>
    </div>
  </div>
</template-->

<style scoped>
.phone-number {
  margin: 50px;
  font-size: 20px;
  color: red;

  .prefix {
    font-size: 20px;
    font-weight: 500;
  }
  .suffix {

  }
}

.manager-layout {
  height: 100%;
  min-height: 100vh;

  padding-top: 20px;
  padding-bottom: 20px;
  padding-left: 24px;
  padding-right: 24px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 60px;

  h1 {
    font-size: 40px;
    font-weight: bolder;
  }

  h3 {
    font-size: 20px;
    font-weight: 500;
    color: #686868;
  }
}

.main-layout {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .filters-container {
    .title {
      display: flex;
      align-items: center;
      gap: 4px;

      margin-bottom: 6px;

      img {
        height: 18px;
      }

      p {
        font-size: 20px;
        font-weight: 500;
        color: #2c3e50;
      }
    }

    .filters {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 7px;

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

      .add-filter {
        padding-top: 4px;
        padding-bottom: 4px;
        padding-left: 8px;
        padding-right: 8px;

        display: flex;
        align-items: center;
        gap: 6px;

        border-radius: 6px;
        border: #aad9a3 dashed 2px;

        cursor: pointer;

        img {
          height: 18px;
        }

        span {
          font-weight: 500;
          color: #3f603b;
        }
      }
    }
  }

  .search-box {
    height: fit-content;
    padding: 6px;

    display: flex;

    border-radius: 6px;
    border: #e6e6e6 solid 1px;

    box-shadow:
        rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
        rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;

    label {
      padding-right: 6px;

      display: flex;
      align-items: center;

      img {
        height: 16px;

        fill: gray;
      }
    }

    input {
      border: 0;
    }

    input:focus {
      border: 0;
      outline: 0;
    }
  }
}

.checkboxvalue {
  outline: 0;
  border: 0;
  border: red solid 2px;
  background-color: red;

  :checked {
    ~ .checkmark {
       background-color: #ccc;
    }
  }
  ~ .checkmark {

  }
}

.table {
  width: 100%;

  display: flex;
  flex-direction: column;
  /*gap: 8px;*/

  .headers-container {
    padding-bottom: 14px;

    display: flex;
    justify-content: space-between;
    gap: 20px;

    div {
      width: 100%;

      display: flex;
      justify-content: space-between;

      div {
        display: flex;
        align-items: center;
        gap: 4px;

        div {
          img {
            height: 16px;
          }

          .value {
            width: 100%;

            font-size: 16px;
            font-weight: 600;
            text-transform: capitalize;

            color: #515151;
          }
        }

        img {
          height: 16px;
        }
      }
    }
  }
  .rows-container {
    width: 100%;
  }
}

.footer {
  display: flex;
  justify-content: space-between;

  .rows-per-page {
    display: flex;
    align-items: center;
    gap: 6px;

    div {
      height: fit-content;
      padding: 6px;

      display: flex;
      align-items: center;
      gap: 4px;

      border-radius: 6px;
      border: #e6e6e6 solid 1px;

      box-shadow:
        rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
        rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;

      img {
        height: 16px;
      }
    }
  }

  .page-selector {
    display: flex;
    align-items: center;

    img {
      height: 16px;
      margin: 6px;

      border-radius: 6px;
      border: #fbfbfb solid 1px;

      box-shadow:
        rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
        rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
    }
  }
}

.separator {
  height: 1px;
  background-color: #e6e6e6;
}
.big-separator {
  height: 2px;
  background-color: #e6e6e6;
}

.vertical-separator {
  width: 1px;
  height: 16px;
  background-color: #e6e6e6;
}
</style>

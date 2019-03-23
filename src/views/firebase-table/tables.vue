<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        :placeholder="collection.name"
        v-model="listQuery.label"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >Search</el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >Add New</el-button>
    </div>

    <el-table
      v-loading="this.listLoading"
      :data="this.list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <!-- Date column -->
      <el-table-column
        v-for="(column, index) in collection.fields"
        :prop="column.label"
        :key="index"
        align="center"
        :label="column.label"
        :width="column.tableWidth || 200"
        v-if="column.type === 'date' && column.tableVisible"
      >
        <template slot-scope="scope">
          <i class="el-icon-time"/>
          <span>{{(scope.row[column.field] != null ? scope.row[column.field].seconds :  0 ) | dateChatFormat }}</span>
        </template>
      </el-table-column>

      <!-- String column -->
      <el-table-column
        v-for="(column, index) in collection.fields"
        :prop="column.label"
        :key="index"
        align="center"
        :label="column.label"
        :width="column.tableWidth || 200"
        v-if="column.type === 'string' && !column.ref && column.tableVisible "
      >
        <template slot-scope="scope">
          <span>{{scope.row[column.field] || '-' }}</span>
        </template>
      </el-table-column>

      <!-- Tag column -->
      <el-table-column
        v-for="(column, index) in collection.fields"
        :prop="column.label"
        :key="index"
        align="center"
        :label="column.label"
        :width="column.tableWidth || 200"
        v-if="column.type === 'tag' && column.tableVisible"
      >
        <template slot-scope="scope">
          <el-tag
            :key="index"
            v-for="(itemTag, index) in scope.row[column.field]"
            :type="itemTag | tagFilter"
          >{{ itemTag }}</el-tag>
        </template>
      </el-table-column>

      <!-- Tag column -->
      <el-table-column
        v-for="(column, index) in collection.fields"
        :prop="column.label"
        :key="index"
        align="center"
        :label="column.label"
        :width="column.tableWidth || 200"
        v-if="column.type === 'time' && column.tableVisible"
      >
        <template slot-scope="scope">
          <span>{{(scope.row[column.field] != null ? scope.row[column.field].seconds :  0 ) | formatDate }}</span>
        </template>
      </el-table-column>

      <!-- ID column -->
      <el-table-column
        v-for="(column, index) in collection.fields"
        :prop="column.label"
        :key="index"
        align="center"
        :label="column.label"
        :width="column.tableWidth || 200"
        v-if="column.type === 'id' && column.tableVisible"
      >
        <template slot-scope="scope">
          <el-tag>
            {{
            mappingCollection(column.collection, scope.row[column.field], column.collectionFieldLabel)
            }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- options column -->
      <el-table-column
        v-for="(column, index) in collection.fields"
        :prop="column.label"
        :key="index"
        align="center"
        :label="column.label"
        :width="column.tableWidth || 200"
        v-if="column.type === 'options' && column.tableVisible"
      >
        <template slot-scope="scope">
          <el-tag>
            {{
            mappingCollection(column.collection, scope.row[column.field], column.collectionFieldLabel)
            }}
          </el-tag>
        </template>
      </el-table-column>
      

      <el-table-column
        :label="'Actions'"
        align="center"
        min-width="100"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button type="danger" @click="handleUpdate(scope.row)" size="mini">{{ 'Delete' }}</el-button>
          <el-button type="primary" @click="handleUpdate(scope.row)" size="mini">{{ 'Edit' }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="listSize() > 0"
      :total="listSize()"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!--
         :rules="rules" 
    -->
    <el-dialog :title="'Create ' + collection.name" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :model="temp"
        label-position="left"
        label-width="70px"
        style="width: 400px; margin-left:50px;"
      >
        <!-- STRING INPUT -->
        <el-form-item
          :key="index"
          v-if="column.editable && column.type == 'string'"
          v-for="(column, index) in collection.fields"
          :label="column.label"
          :prop="column.field"
        >
          <el-input v-model="temp[column.field]"/>
        </el-form-item>

        <!-- SELECT BY ID -->
        <el-form-item
          :key="index"
          v-if="column.editable && column.type == 'id'"
          v-for="(column, index) in collection.fields"
          :label="column.label"
          :prop="column.field"
        >
          <el-select v-model="temp[column.field]" class="filter-item" placeholder="Please select">
            <el-option
              v-for="item in $store.state[column.collection].docs"
              :key="item.id"
              :label="mappingCollection(column.collection, item.id, column.collectionFieldLabel)"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <!-- SELECT BY ID -->
        <el-form-item
          :key="index"
          v-if="column.editable && column.type == 'options'"
          v-for="(column, index) in collection.fields"
          :label="column.label"
          :prop="column.field"
        >
          <el-select v-model="temp[column.field]" class="filter-item" placeholder="Please select">
            <el-option
              v-for="item in column.options"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        

        <!-- STRING INPUT -->
    
        <div  class="new-form-group" :key="field.id" v-for="(field, index) in temp.fields">
                <el-button type="danger" class="remove-btn" @click="removeField(temp, index)">X</el-button>
                <label>Table Field</label><br/><br/>
                <el-form-item :label="'Field'">
                    <el-input v-model="field.name"/>
                </el-form-item>
                <el-form-item :label="'Type'">
                    <el-select v-model="field.type" class="filter-item" placeholder="Please select">
                        <el-option
                            v-for="item in ['string', 'date', 'id']"
                            :key="item"
                            :label="item"
                            :value="item"
                        />
                    </el-select>
                </el-form-item>

                <div v-if="field.type == 'id'">
                    <el-form-item :label="'Collection'">
                        <el-select v-model="field.collection" class="filter-item" placeholder="Please select">
                            <el-option
                            v-for="item in $store.state['tables'].docs"
                            :key="item.id"
                            :label="mappingCollection('tables', item.id, 'name')"
                            :value="item.id"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="'Field'">
                        <el-input v-model="field.collectionFieldLabel"/>
                    </el-form-item>
                </div>
        </div>
        
        <el-button @click="addField(temp)">+</el-button>
        

        <!-- 
        <el-form-item :label="$t('table.type')" prop="type">
          <el-select v-model="temp.type" class="filter-item" placeholder="Please select">
            <el-option
              v-for="item in calendarTypeOptions"
              :key="item.key"
              :label="item.display_name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('table.date')" prop="timestamp">
          <el-date-picker
            v-model="temp.timestamp"
            type="datetime"
            placeholder="Please pick a date"
          />
        </el-form-item>
        <el-form-item :label="$t('table.title')" prop="label">
          <el-input v-model="temp.label"/>
        </el-form-item>
        <el-form-item :label="$t('table.status')">
          <el-select v-model="temp.status" class="filter-item" placeholder="Please select">
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('table.importance')">
          <el-rate
            v-model="temp.importance"
            :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
            :max="3"
            style="margin-top:8px;"
          />
        </el-form-item>
        <el-form-item :label="$t('table.remark')">
          <el-input
            :autosize="{ minRows: 2, maxRows: 4}"
            v-model="temp.remark"
            type="textarea"
            placeholder="Please input"
          />
        </el-form-item> 
        -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">close</el-button>
        <el-button type="danger" @click="deleteData()">{{ 'Delete' }}</el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create'? createData() : updateData()"
        >Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
    .new-form-group {
        padding: 20px 20px 0px 20px;
        margin-bottom: 10px;
        border-radius: 5px;
        border: solid 1px #dbdfe6;
    }

    .remove-btn {
        width: 20px;
        height: 20px;
        padding: 0px;
        position: absolute;
        left: 428px;
    }
</style>


<script>
import FIRTable from "@/views/firebase-table";
import Vue from 'vue'

export default {   
  methods: {
    initData: function() {
      return {
        collection: {
          name: "tables",
          filter: {},
          fields: [
            {
              label: "created_at",
              field: "created_at",
              type: "date",
              tableVisible: true
            },
            {
              label: "updated_at",
              field: "updated_at",
              type: "date",
              tableVisible: false
            },
            {
              label: "Name",
              field: "name",
              type: "string",
              tableWidth: 200,
              editable: true,
              tableVisible: true
            },
            {
              label: "Title",
              field: "title",
              type: "string",
              tableWidth: 50,
              editable: true,
              tableVisible: false
            },
            {
              label: "Icon",
              field: "icon",
              type: "string",
              tableWidth: 50,
              editable: true,
              tableVisible: false
            },
            {
              label: "fields",
              field: "fields",
              type: "array",
              tableWidth: 100,
              editable: true,
              tableVisible: false
            }
          ]
        }
      };
    },
    removeField: function(table, index){
        table.fields.splice(index,1);
    },
    addField: function(table){

        if (table.fields == undefined){
            Vue.set(table, "fields", [])
        }
        
        table.fields.push(
        {
            name: "",
            type: "string",
            id: new Date().getTime()
        })
    }
  },  
  data: function() {
    return {
        newFields : []
    };
  },
  mixins: [FIRTable]
};
</script>

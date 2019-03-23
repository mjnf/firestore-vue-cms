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
          <span>{{(scope.row[column.field] != null ? scope.row[column.field].seconds : 0 ) | dateChatFormat }}</span>
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
          <span>{{(scope.row[column.field] != null ? scope.row[column.field].seconds : 0 ) | formatDate }}</span>
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
          <el-select
            v-if="$store.state[column.collection] != null"
            v-model="temp[column.field]"
            class="filter-item"
            placeholder="Please select"
          >
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
            <el-option v-for="item in column.options" :key="item" :label="item" :value="item"/>
          </el-select>
        </el-form-item>

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

<style lang="scss">
.el-table .cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.el-dialog {
  width: 80%;
}

.filter-container {
  padding-bottom: 10px;
  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-bottom: 10px;
  }
}
</style>


<script>
import FIRCollection from "@/store/modules/FIRCollection";
import Vue from "vue";
import waves from "@/directive/waves"; // Waves directive
import Pagination from "@/components/Pagination"; // Secondary package based on el-pagination

export default {
  components: { Pagination },
  directives: { waves },
  filters: {
    tagFilter(status) {
      return status.length % 2 == 0
        ? "success"
        : status.length % 1 == 0
        ? "gray"
        : "danger";
    }
  },
  computed: {
    listLoading() {
      if (this.$store.state[this.collection.name]) {
        return this.$store.state[this.collection.name].listLoading;
      }
      return true;
    },
    list() {
      // If Collection is created
      if (this.$store.state[this.collection.name]) {
        // Get Docs and current page start Index
        const docs = this.$store.state[this.collection.name].docs;
        const startIndex = (this.listQuery.page - 1) * this.listQuery.limit;

        if (startIndex + this.listQuery.limit <= docs.length) {
          // If docs have all docs for current page
          return docs.slice(startIndex, startIndex + this.listQuery.limit);
        } else if (this.listSize() == docs.length && docs.length != 0) {
          // If have parcial docs for current page and all docs was loaded
          return docs.slice(startIndex, docs.length);
        }

        this.loadNext();
        return [];
      } else {
        return [];
      }
    }
  },
  data: function() {
    var base = {
      temp: {},
      dialogFormVisible: false,
      listQuery: {
        page: 1,
        limit: 10
      }
    };

    return _.merge(base, this.initData());
  },
  created() {
    //this.initData();
    this.initCollection();
  },
  methods: {
    initCollection() {
      const state = this.$store.state;

      if (!state[this.collection.name]) {
        try {
          // --------------------------  Load Main Table Collection --------------------------
          this.$store.registerModule(this.collection.name, FIRCollection);
          this.$store.dispatch(
            this.collection.name + "/Init",
            {
              collection: this.collection.name,
              listQuery: this.listQuery
            },
            { root: false }
          );

          // -------------------------- Load Table References --------------------------
          for (let index = 0; index < this.collection.fields.length; index++) {
            var field = this.collection.fields[index];
            if (field.ref && !state[field.collection]) {
              this.$store.registerModule(field.collection, FIRCollection);
              this.$store.dispatch(
                field.collection + "/Init",
                {
                  collection: field.collection
                },
                { root: false }
              );
              this.$store.dispatch(
                field.collection + "/LoadNext",
                {
                  listQuery: this.listQuery
                },
                { root: false }
              );
            }
          }
        } catch (e) {
          console.log(e);
        }
      }
    },
    resetTemp() {
      this.temp = {};
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        //this.$refs['dataForm'].clearValidate()
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    updateData(row) {
      this.dialogFormVisible = false;
      this.$store.dispatch(this.collection.name + "/UpdateDoc", this.temp, {
        root: false
      });
    },
    createData(row) {
      this.dialogFormVisible = false;
      this.$store.dispatch(this.collection.name + "/CreateDoc", this.temp, {
        root: false
      });
    },
    deleteData() {
      this.dialogFormVisible = false;
      this.$store.dispatch(this.collection.name + "/RemoveDoc", this.temp, {
        root: false
      });
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row); // copy obj
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        //this.$refs['dataForm'].clearValidate()
      });
    },
    listSize() {
      return this.$store.state[this.collection.name]
        ? this.$store.state[this.collection.name].size
        : 0;
    },
    getList() {
      //console.log(this.listQuery);
    },
    loadNext() {
      this.$store.dispatch(
        this.collection.name + "/LoadNext",
        {
          listQuery: this.listQuery
        },
        { root: false }
      );
    },
    initData: function() {
      // Here define table model
      return {};
    },
    mappingCollection: function(toMap, id, label) {
      if (
        this.$store.state[toMap] &&
        this.$store.state[toMap].docs.length &&
        id != undefined &&
        this.$store.state[toMap].byId[id]
      ) {
        return this.$store.state[toMap].byId[id][label];
      }
      return id;
    }
  }
};
</script>

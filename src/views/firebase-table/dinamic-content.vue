<script>
import FIRTable from "@/views/firebase-table";
import Router from "vue-router";

export default {
  watch: {
    '$route.params.collection': function (collection) {
        console.log(collection)
      
      this.temp = {};
      this.dialogFormVisible = false;
      this.listQuery = {
        page: 1,
        limit: 10
      }

      this.collection = {
          name: this.$route.params.collection,
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
              tableVisible: true
            }
          ]
        }

        var table = _.find(this.$store.state.app.tables.tables, {
            name: this.$route.params.collection
        });

      for (let index = 0; index < table.fields.length; index++) {
        const element = table.fields[index];

        this.collection.fields.push({
          label: element.name,
          field: element.name,
          type: element.type,
          tableWidth: 100,
          editable: true,
          tableVisible: true
        });
      }

      this.initCollection();
    }
  },
  methods: {
    initData: function() {
      var data = {
        collection: {
          name: this.$route.params.collection,
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
              tableVisible: true
            }
          ]
        }
      };

      var table = _.find(this.$store.state.app.tables.tables, {
        name: this.$route.params.collection
      });

      for (let index = 0; index < table.fields.length; index++) {
        const element = table.fields[index];

        data.collection.fields.push({
          label: element.name,
          field: element.name,
          type: element.type,
          tableWidth: 100,
          editable: true,
          tableVisible: true
        });
      }

      return data;
    }
  },
  mixins: [FIRTable]
};
</script>

<script>
import FIRTable from "@/views/firebase-table";

export default {
  methods: {
    initData: function() {
      return {
        collection: {
          name: "divisions",
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
            },
            {
              label: "Name",
              field: "name",
              type: "string",
              tableWidth: 300,
              editable: true,
              tableVisible: true
            }
          ]
        }
      };
    }
  },
  mixins: [FIRTable]
};
</script>

<script>
import FIRTable from "@/views/firebase-table";

export default {
  methods: {
    initData: function() {
      return {
        collection: {
          name: "users",
          filter: {},
          fields: [
            {
              label: "created_at",
              field: "created_at",
              type: "date",
              tableWidth: 150,
              editable: false,
              tableVisible: true
            },
            {
              label: "Email",
              field: "email",
              type: "string",
              editable: true,
              tableVisible: true
            },
            {
              label: "Name",
              field: "name",
              type: "string",
              editable: true,
              tableVisible: false
            },
            {
              label: "Roles",
              field: "roles",
              type: "tag",
              editable: true,
              tableVisible: true
            },
            {
              label: "Division",
              field: "division",
              type: "id",
              collection: "divisions",
              collectionFieldLabel: "name",
              ref: true,
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
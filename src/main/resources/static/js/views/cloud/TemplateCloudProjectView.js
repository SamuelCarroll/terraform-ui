define([
  'jquery',
  'underscore',
  'backbone',
  'datatable',
  'databoot',
  'util',
  'collections/cloud/CloudProjectCollection',
  'text!/templates/cloudProjectTemplate.html'
], function($, _, Backbone, datatable, databoot, Util, CloudProjectCollection, cloudProjectTemplate) {
  var cloudTemplateView = Backbone.View.extend({
    el: $('#container-content'),
    events: {
      'click #create_project': 'showCreateProjectView',
      'click #new_project_save': 'saveNewProject',
      'click #new_project_cancel': 'cancelCreateProjectView',
      'click #copy_project': 'showCopyProjectView',
      'click #copy_project_cancel': 'cancelCopyProjectView'
    },

    initialize: function() {
      this.cloud = 'template';
      this.cloudProjectCollection = new CloudProjectCollection({
        'cloudType': this.cloud
      });
    },

    render: function() {
      var that = this;
      $(".sidebar").find(".active").toggleClass("active");
      $(".sidebar").find("#template_link").addClass("active");
      this.cloudProjectCollection.fetch({
        success: function(model) {
          var data = {
            "projects": model.toJSON(),
            "cloudType": that.cloud
          };
          that.compiledTemplate = _.template(cloudProjectTemplate)(data);
          that.$el.html(that.compiledTemplate);
          $('.table').dataTable({
            searching: false
          });
        },
        error: function(response) {
          console.log("Error occured while fetching the data:" + response);
        }
      });
    },

    showCreateProjectView: function() {
      Util.swap($('#show_projects'), $('#new_project_div'));
    },

    showCopyProjectView: function() {
      Util.swap($('#show_projects'), $('#new_project_div'));
    },

    saveNewProject: function(e) {
      var projectName = $('#new_project_name').val();
      var cloudType = $('#new_project_cloud'.val());
      var that = this;
      //todo find a way to get the cloudType as a drop down menu
      this.cloudProjectCollection.create({
        name: projectName,
        cloudType: this.cloud //set this to not template
      }, {
        wait: true,
        success: function(resp) {
          that.render();
        }
      });
    },

    cancelCreateProjectView: function() {
      Util.swap($('#new_project_div'), $('#show_projects'));
    },

    //todo get this to show all current images (allow for new name)
    cancelCopyProjectView: function() {
      Util.swap($('#new_project_div'), $('#show_projects'));
    },

    onClose: function() {
      this.stopListening();
      this.cloudProjectCollection.unbind("change", this.render);
    }
  });

  return cloudTemplateView;
});

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
      //'click #copy_project_save' : 'saveCopyProject',
      'click #copy_project_cancel': 'cancelCopyProjectView',
      'click .apply-action': 'applyProject'
    },

    initialize: function() {
      this.cloud = 'aws';
      this.cloudProjectCollection = new CloudProjectCollection({
        'cloudType': this.cloud
      });
    },

    doRender: function() {
      var that = this;
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

    render: function() {
      $(".sidebar").find(".active").toggleClass("active");
      $(".sidebar").find("#aws_link").addClass("active");
      this.doRender();
    },

    showCreateProjectView: function() {
      Util.swap($('#show_projects'), $('#new_project_div'));
    },

    showCopyProjectView: function() {
      Util.swap($('#show_projects'), $('#copy_project_div'));
    },


    saveNewProject: function(e) {
      var projectName = $('#new_project_name').val();
      var that = this;
      this.cloudProjectCollection.create({
        name: projectName,
        cloudType: this.cloud
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

    /*saveCopyProject: function(e){
    	var projectSrc = $('#copy_project_src').val();
    	var projectName = $('#copy_project_name').val();
    	var that=this;
    	this.cloudProjectCollection.copy({src:projectSrc,name: projectName,cloudType:this.cloud},{
    		wait : true,
    		success : function(resp){
    			that.render();
    		}
    	});
    }*/

    cancelCopyProjectView: function() {
      Util.swap($('#copy_project_div'), $('#show_projects'));
    },

    applyProject: function(event) {
      var projectId = $(event.target).attr('id');
      var that = this;
      $.ajax({
        type: "POST",
        url: "/project/" + projectId + "/apply",
        async: false,
        success: function(response) {
          Util.block();
          that.doPoll(projectId);
        },
        error: function(response) {},
        complete: function() {}
      });
    },

    doPoll: function(projectId) {
      var that = this;
      $.get("/project/" + projectId + "/poll", function(data) {
        if (data != 'Complete') {
          //$(".scrollmessage span").fadeOut('slow');
          //	        	$(".scrollmessage span").text(data);
          setTimeout(that.doPoll(projectId), 3000);
        } else {
          Util.hide();
          $(".scrollmessage").show();
          $(".scrollmessage span").text(data);
          setTimeout(function() {
            $(".scrollmessage").hide();
            that.doRender();
          }, 5000);
        }
      });
    },

    onClose: function() {
      this.stopListening();
      this.cloudProjectCollection.unbind("change", this.render);
    }
  });

  return cloudTemplateView;
});

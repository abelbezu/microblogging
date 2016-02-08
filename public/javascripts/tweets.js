$(document).on('click', '.delete-tweet', function(evt) {
      var item = $(this).parent().parent().parent().parent().parent();
      var username_id = item.attr('username-id');
      $.ajax({
          url: '/tweets',
          data: {"identifier" : username_id},
          type: 'DELETE'
      }).done(function(response) {
          item.remove();
      }).fail(function(responseObject) {
          var response = $.parseJSON(responseObject.responseText);
          $('.error').text(response.err);
      });
  });
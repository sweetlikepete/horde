module.exports = {

   /**
    * Escape special characters in the given string of html.
    *
    * @param  {String} value
    * @return {String}
    */
    wtf : function(value) {

        return "wtf:" + value;

    },

    bower : require('tasks/bower')

}
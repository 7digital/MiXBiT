/*
 * GET home page.
 */
exports.index = function(req, res){
	
  // http://blog.nodeknockout.com/post/35364532732/protip-add-the-vote-ko-badge-to-your-app

  res.render('home', { title: '7digital Knockout' });
};

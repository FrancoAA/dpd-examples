
dpd.users.get({id: this.creator}, function(user) {
    this.ownerName = user.username;
});
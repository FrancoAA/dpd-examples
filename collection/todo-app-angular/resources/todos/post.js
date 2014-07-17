if (!me) cancel('primero debe iniciar sesion', 401);

protect('creator');
protect('created');
protect('modifiedBy');
protect('lastUpdated');

this.creator = me.id;
this.created = new Date();

emit('todos:changed', this.creator);
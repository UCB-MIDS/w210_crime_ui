#!venv/bin/python
import os
import s3fs
from flask import Flask, url_for, redirect, render_template, request, abort
from flask_sqlalchemy import SQLAlchemy
from flask_security import Security, SQLAlchemyUserDatastore, \
    UserMixin, RoleMixin, login_required, current_user
from flask_security.utils import encrypt_password
import flask_admin
from flask_admin.contrib import sqla
from flask_admin import helpers as admin_helpers
from flask_admin import BaseView, expose

### Load Flask configuration file
s3fs.S3FileSystem.read_timeout = 5184000  # one day
s3fs.S3FileSystem.connect_timeout = 5184000  # one day
s3 = s3fs.S3FileSystem(anon=False)
config_file = 'w210policedata/config/config.py'
try:
    s3.get(config_file,'config.py')
except:
    print('Failed to load application configuration file!')

# Create Flask application
application = Flask(__name__)
application.config.from_pyfile('config.py')
db = SQLAlchemy(application)


# Define models

### SECURITY Model

roles_users = db.Table(
    'roles_users',
    db.Column('user_id', db.Integer(), db.ForeignKey('user.id')),
    db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))
)


class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

    def __str__(self):
        return self.name


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(255))
    last_name = db.Column(db.String(255))
    email = db.Column(db.String(255), unique=True)
    password = db.Column(db.String(255))
    active = db.Column(db.Boolean())
    confirmed_at = db.Column(db.DateTime())
    roles = db.relationship('Role', secondary=roles_users,
                            backref=db.backref('users', lazy='dynamic'))

    def __str__(self):
        return self.email


# Setup Flask-Security
user_datastore = SQLAlchemyUserDatastore(db, User, Role)
security = Security(application, user_datastore)


# Create customized model view class
class MyModelView(sqla.ModelView):

    def is_accessible(self):
        if not current_user.is_active or not current_user.is_authenticated:
            return False

        if current_user.has_role('superuser'):
            return True

        return False

    def _handle_view(self, name, **kwargs):
        """
        Override builtin _handle_view in order to redirect users when a view is not accessible.
        """
        if not self.is_accessible():
            if current_user.is_authenticated:
                # permission denied
                abort(403)
            else:
                # login
                return redirect(url_for('security.login', next=request.url))


    # can_edit = True
    edit_modal = True
    create_modal = True
    can_export = True
    can_view_details = True
    details_modal = True
    can_create = False
    can_edit = False
    can_delete = False

class UserView(MyModelView):
    column_editable_list = ['email', 'first_name', 'last_name']
    column_searchable_list = column_editable_list
    column_exclude_list = ['password']
    # form_excluded_columns = column_exclude_list
    column_details_exclude_list = column_exclude_list
    column_filters = column_editable_list
    can_create = False
    can_edit = False
    can_delete = False

class CustomView(BaseView):
    @expose('/')
    def index(self):
        return self.render('admin/custom_index.html')

### POLICE DEPLOYMENT Model

communities = { 'community': [
                    ('01', 'Rogers Park', 0),
                    ('02', 'West Ridge', 0),
                    ('03', 'Uptown', 0),
                    ('04', 'Lincoln Square', 0),
                    ('05', 'North Center', 0),
                    ('06', 'Lakeview', 0),
                    ('07', 'Lincoln Park', 0),
                    ('08', 'Near North Side', 0),
                    ('09', 'Edison Park', 0),
                    ('10', 'Norwood Park', 0),
                    ('11', 'Jefferson Park', 0),
                    ('12', 'Forest Glen', 0),
                    ('13', 'North Park', 0),
                    ('14', 'Albany Park', 2),
                    ('15', 'Portage Park', 0),
                    ('16', 'Irving Park', 2),
                    ('17', 'Dunning', 0),
                    ('18', 'Montclare', 2),
                    ('19', 'Belmont Cragin', 2),
                    ('20', 'Hermosa', 2),
                    ('21', 'Avondale', 2),
                    ('22', 'Logan Square', 2),
                    ('23', 'Humboldt Park', 2),
                    ('24', 'West Town', 0),
                    ('25', 'Austin', 3),
                    ('26', 'West Garfield Park', 3),
                    ('27', 'East Garfield Park', 3),
                    ('28', 'Near West Side', 0),
                    ('29', 'North Lawndale', 3),
                    ('30', 'South Lawndale', 2),
                    ('31', 'Lower West Side', 2),
                    ('32', 'The Loop', 0),
                    ('33', 'Near South Side', 0),
                    ('34', 'Armour Square', 1),
                    ('35', 'Douglas', 3),
                    ('36', 'Oakland', 3),
                    ('37', 'Fuller Park', 3),
                    ('38', 'Grand Boulevard', 3),
                    ('39', 'Kenwood', 3),
                    ('40', 'Washington Park', 3),
                    ('41', 'Hyde Park', 0),
                    ('42', 'Woodlawn', 3),
                    ('43', 'South Shore', 3),
                    ('44', 'Chatham', 3),
                    ('45', 'Avalon Park', 3),
                    ('46', 'South Chicago', 3),
                    ('47', 'Burnside', 3),
                    ('48', 'Calumet Heights', 3),
                    ('49', 'Roseland', 3),
                    ('50', 'Pullman', 3),
                    ('51', 'South Deering', 3),
                    ('52', 'East Side', 2),
                    ('53', 'West Pullman', 3),
                    ('54', 'Riverdale', 3),
                    ('55', 'Hegewisch', 2),
                    ('56', 'Garfield Ridge', 2),
                    ('57', 'Archer Heights', 2),
                    ('58', 'Brighton Park', 2),
                    ('59', 'McKinley Park', 2),
                    ('60', 'Bridgeport', 1),
                    ('61', 'New City', 2),
                    ('62', 'West Elsdon', 2),
                    ('63', 'Gage Park', 2),
                    ('64', 'Clearing', 2),
                    ('65', 'West Lawn', 2),
                    ('66', 'Chicago Lawn', 2),
                    ('67', 'West Englewood', 3),
                    ('68', 'Englewood', 3),
                    ('69', 'Greater Grand Crossing', 3),
                    ('70', 'Ashburn', 3),
                    ('71', 'Auburn Gresham', 3),
                    ('72', 'Beverly', 0),
                    ('73', 'Washington Heights', 3),
                    ('74', 'Mount Greenwood', 0),
                    ('75', 'Morgan Park', 3),
                    ('76', 'O\'Hare', 0),
                    ('77', 'Edgewater', 0)
                ]}

districts = {1: dict(id=1, name='1st District – Central', address='1718 South State Street', zipcode='60616', community='33', patrols=6),
             2: dict(id=2, name='2nd District – Wentworth', address='5101 South Wentworh Avenue', zipcode='60609', community='37', patrols=4),
             3: dict(id=3, name='3rd District – Grand Crossing', address='7040 South Cottage Grove Avenue', zipcode='60637', community='69', patrols=3),
             4: dict(id=4, name='4th District – South Chicago', address='2255 East 103rd St', zipcode='60617', community='51', patrols=3),
             5: dict(id=5, name='5th District – Calumet', address='727 East 111th St', zipcode='60628', community='50', patrols=2),
             6: dict(id=6, name='6th District – Gresham', address='7808 South Halsted Street', zipcode='60620', community='71', patrols=4),
             7: dict(id=7, name='7th District – Englewood', address='1438 W. 63rd Street', zipcode='60636', community='67', patrols=2),
             8: dict(id=8, name='8th District – Chicago Lawn', address='3420 West 63rd St', zipcode='60629', community='66', patrols=3),
             9: dict(id=9, name='9th District – Deering', address='3120 S. Halsted St.', zipcode='60608', community='60', patrols=2),
             10: dict(id=10, name='10th District – Ogden', address='3315 West Ogden Avenue', zipcode='60623', community='29', patrols=3),
             11: dict(id=11, name='11th District – Harrison', address='3151 West Harrison St', zipcode='60612', community='27', patrols=2),
             12: dict(id=12, name='12th District – Near West', address='1412 S. Blue Island', zipcode='60608', community='28', patrols=4),
             14: dict(id=14, name='14th District – Shakespeare', address='2150 North California Ave', zipcode='60647', community='22', patrols=2),
             15: dict(id=15, name='15th District – Austin', address='5701 West Madison Ave', zipcode='60644', community='25', patrols=3),
             16: dict(id=16, name='16th District – Jefferson Park', address='5151 North Milwaukee Ave', zipcode='60630', community='11', patrols=2),
             17: dict(id=17, name='17th District – Albany Park', address='4650 North Pulaski Rd', zipcode='60630', community='14', patrols=3),
             18: dict(id=18, name='18th District – Near North', address='1160 North Larrabee Ave', zipcode='60610', community='8', patrols=4),
             19: dict(id=19, name='19th District – Town Hall', address='850 West Addison St.', zipcode='60613', community='6', patrols=5),
             20: dict(id=20, name='20th District – Lincoln', address='5400 North Lincoln Avenue', zipcode='60625', community='4', patrols=3),
             22: dict(id=22, name='22nd District – Morgan Park', address='1900 West Monterey Ave', zipcode='60643', community='75', patrols=3),
             24: dict(id=24, name='24th District – Rogers Park', address='6464 North Clark St', zipcode='60626', community='1', patrols=2),
             25: dict(id=25, name='25th District – Grand Central', address='5555 West Grand Ave', zipcode='60639', community='19', patrols=4)}

class Community(db.Model):
    __tablename__ = 'community'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.Integer)
    name = db.Column(db.String(255))
    ethnicity = db.Column(db.Integer)

    def __str__(self):
        return self.name

def ethnicity_formatter(view, context, model, name):
    db_value = getattr(model, name)
    ethnicity = {
                    0: 'White',
                    1: 'Asian',
                    2: 'Hispanic/Latin',
                    3: 'Black'
                }
    return ethnicity[db_value]

class CommunityView(MyModelView):
    column_editable_list = []
    column_searchable_list = column_editable_list
    column_filters = column_editable_list
    column_labels = dict(code='Community Code', name='Community Name', ethnicity='Ethnicity Majority')
    form_choices = {'ethnicity':[
                                    (0, 'White'),
                                    (1, 'Asian'),
                                    (2, 'Hispanic/Latin'),
                                    (3, 'Black')
                                ]}
    column_formatters = {'ethnicity': ethnicity_formatter}
    can_create = False
    can_edit = False
    can_delete = False

class PoliceDistrict(db.Model):
    __tablename__ = 'policedistrict'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    address = db.Column(db.String(255))
    zipcode = db.Column(db.String(255))
    community = db.Column(db.Integer, db.ForeignKey('community.id'))
    community_rel = db.relationship('Community',backref=db.backref('policedistrict', lazy='joined'))
    patrols = db.Column(db.Integer)

    def __str__(self):
        return self.name

class PoliceDistrictView(MyModelView):
    column_list = ['name', 'address', 'zipcode', 'community_rel', 'patrols']
    column_editable_list = ['patrols']
    column_searchable_list = column_editable_list
    column_filters = column_editable_list
    column_labels = dict(name='District Name', address='Address', zipcode='ZIP Code', community_rel='Community', patrols='Number of Available Patrols')
    form_choices = communities
    can_create = False
    can_edit = True
    can_delete = False

class Distance(db.Model):
    __tablename__ = 'distances'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    district = db.Column(db.Integer, db.ForeignKey('policedistrict.id'))
    district_rel = db.relationship('PoliceDistrict')
    community = db.Column(db.Integer, db.ForeignKey('community.id'))
    community_rel = db.relationship('Community')
    distance = db.Column(db.Float())

    def __str__(self):
        return self.id

class DistanceView(MyModelView):
    column_list = ['name', 'district_rel', 'community_rel', 'distance']
    column_editable_list = []
    column_searchable_list = column_editable_list
    column_filters = column_editable_list
    column_labels = dict(name='Route', district_rel='District', community_rel='Community', distance='Distance Between District and Community')
    form_choices = communities
    can_create = False
    can_edit = False
    can_delete = False

class PatrolDeployment(db.Model):
    __tablename__ = 'patroldeployment'
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date)
    period = db.Column(db.String(255))
    district = db.Column(db.Integer, db.ForeignKey('policedistrict.id'))
    district_rel = db.relationship('PoliceDistrict')
    community = db.Column(db.Integer, db.ForeignKey('community.id'))
    community_rel = db.relationship('Community')
    patrols = db.Column(db.Integer())

    def __str__(self):
        return self.id

class PatrolDeploymentView(BaseView):
    @expose('/')
    def index(self):
        return self.render('admin/planning.html')

class MLSettingsView(BaseView):
    @expose('/')
    def index(self):
        return self.render('admin/mlsettings.html')

# Flask views
@application.route('/')
def index():
    return render_template('index.html')

# Create admin
admin = flask_admin.Admin(
    application,
    'OptiPol',
    base_template='my_master.html',
    template_mode='bootstrap3',
)

# Add model views
admin.add_view(MyModelView(Role, db.session, menu_icon_type='fa', menu_icon_value='fa-server', name="Roles"))
admin.add_view(UserView(User, db.session, menu_icon_type='fa', menu_icon_value='fa-users', name="Users"))
admin.add_view(CommunityView(Community, db.session, menu_icon_type='fa', menu_icon_value='fa-map-marker', name="Communities"))
admin.add_view(PoliceDistrictView(PoliceDistrict, db.session, menu_icon_type='fa', menu_icon_value='fa-bank', name="Police Districts"))
admin.add_view(DistanceView(Distance, db.session, menu_icon_type='fa', menu_icon_value='fa-map', name="Distances"))
admin.add_view(PatrolDeploymentView(name="Patrol Deployments", endpoint='planning', menu_icon_type='fa', menu_icon_value='fa-location-arrow'))
admin.add_view(MLSettingsView(name="Machine Learning Settings", endpoint='mlsettings', menu_icon_type='fa', menu_icon_value='fa-connectdevelop'))

# define a context processor for merging flask-admin's template context into the
# flask-security views.
@security.context_processor
def security_context_processor():
    return dict(
        admin_base_template=admin.base_template,
        admin_view=admin.index_view,
        h=admin_helpers,
        get_url=url_for
    )

if __name__ == '__main__':

    # Start application
    application.run(debug=True)

#!venv/bin/python
import os
from flask import Flask, url_for, redirect, render_template, request, abort
from flask_sqlalchemy import SQLAlchemy
from flask_security import Security, SQLAlchemyUserDatastore, \
    UserMixin, RoleMixin, login_required, current_user
from flask_security.utils import encrypt_password
import flask_admin
from flask_admin.contrib import sqla
from flask_admin import helpers as admin_helpers
from flask_admin import BaseView, expose

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

class UserView(MyModelView):
    column_editable_list = ['email', 'first_name', 'last_name']
    column_searchable_list = column_editable_list
    column_exclude_list = ['password']
    # form_excluded_columns = column_exclude_list
    column_details_exclude_list = column_exclude_list
    column_filters = column_editable_list

class CustomView(BaseView):
    @expose('/')
    def index(self):
        return self.render('admin/custom_index.html')

### POLICE DEPLOYMENT Model

communities = { 'community': [
                    ('01', 'Rogers Park'),
                    ('02', 'West Ridge'),
                    ('03', 'Uptown'),
                    ('04', 'Lincoln Square'),
                    ('05', 'North Center'),
                    ('06', 'Lake View'),
                    ('07', 'Lincoln Park'),
                    ('08', 'Near North Side'),
                    ('09', 'Edison Park'),
                    ('10', 'Norwood Park'),
                    ('11', 'Jefferson Park'),
                    ('12', 'Forest Glen'),
                    ('13', 'North Park'),
                    ('14', 'Albany Park'),
                    ('15', 'Portage Park'),
                    ('16', 'Irving Park'),
                    ('17', 'Dunning'),
                    ('18', 'Montclare'),
                    ('19', 'Belmont Cragin'),
                    ('20', 'Hermosa'),
                    ('21', 'Avondale'),
                    ('22', 'Logan Square'),
                    ('23', 'Humboldt Park'),
                    ('24', 'West Town'),
                    ('25', 'Austin'),
                    ('26', 'West Garfield Park'),
                    ('27', 'East Garfield Park'),
                    ('28', 'Near West Side'),
                    ('29', 'North Lawndale'),
                    ('30', 'South Lawndale'),
                    ('31', 'Lower West Side'),
                    ('32', 'The Loop'),
                    ('33', 'Near South Side'),
                    ('34', 'Armour Square'),
                    ('35', 'Douglas'),
                    ('36', 'Oakland'),
                    ('37', 'Fuller Park'),
                    ('38', 'Grand Boulevard'),
                    ('39', 'Kenwood'),
                    ('40', 'Washington Park'),
                    ('41', 'Hyde Park'),
                    ('42', 'Woodlawn'),
                    ('43', 'South Shore'),
                    ('44', 'Chatham'),
                    ('45', 'Avalon Park'),
                    ('46', 'South Chicago'),
                    ('47', 'Burnside'),
                    ('48', 'Calumet Heights'),
                    ('49', 'Roseland'),
                    ('50', 'Pullman'),
                    ('51', 'South Deering'),
                    ('52', 'East Side'),
                    ('53', 'West Pullman'),
                    ('54', 'Riverdale'),
                    ('55', 'Hegewisch'),
                    ('56', 'Garfield Ridge'),
                    ('57', 'Archer Heights'),
                    ('58', 'Brighton Park'),
                    ('59', 'McKinley Park'),
                    ('60', 'Bridgeport'),
                    ('61', 'New City'),
                    ('62', 'West Elsdon'),
                    ('63', 'Gage Park'),
                    ('64', 'Clearing'),
                    ('65', 'West Lawn'),
                    ('66', 'Chicago Lawn'),
                    ('67', 'West Englewood'),
                    ('68', 'Englewood'),
                    ('69', 'Greater Grand Crossing'),
                    ('70', 'Ashburn'),
                    ('71', 'Auburn Gresham'),
                    ('72', 'Beverly'),
                    ('73', 'Washington Heights'),
                    ('74', 'Mount Greenwood'),
                    ('75', 'Morgan Park'),
                    ('76', 'O\'Hare'),
                    ('77', 'Edgewater')
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

    def __str__(self):
        return self.name

class CommunityView(MyModelView):
    column_editable_list = ['code', 'name']
    column_searchable_list = column_editable_list
    column_filters = column_editable_list
    column_labels = dict(code='Community Code', name='Community Name')

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
    column_editable_list = ['name', 'address', 'zipcode', 'community', 'patrols']
    column_searchable_list = column_editable_list
    column_filters = column_editable_list
    column_labels = dict(name='District Name', address='Address', zipcode='ZIP Code', community_rel='Community', patrols='Number of Available Patrols')
    form_choices = communities

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
admin.add_view(CommunityView(Community, db.session, menu_icon_type='fa', menu_icon_value='fa-map-o', name="Communities"))
admin.add_view(PoliceDistrictView(PoliceDistrict, db.session, menu_icon_type='fa', menu_icon_value='fa-bank', name="Police Districts"))
admin.add_view(PatrolDeploymentView(name="Patrol Deployments", endpoint='planning', menu_icon_type='fa', menu_icon_value='fa-connectdevelop',))

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

def build_db():
    """
    Populate a small db with some example entries.
    """

    import string
    import random
    import requests
    import json

    db.drop_all()
    db.create_all()

    with application.app_context():
        user_role = Role(name='user')
        super_user_role = Role(name='superuser')
        db.session.add(user_role)
        db.session.add(super_user_role)
        db.session.commit()

        test_user = user_datastore.create_user(
            first_name='Admin',
            email='admin',
            password=encrypt_password('admin'),
            roles=[user_role, super_user_role]
        )

        first_names = [
            'Harry', 'Amelia', 'Oliver'
        ]
        last_names = [
            'Brown', 'Smith', 'Patel', 'Jones', 'Williams', 'Johnson', 'Taylor', 'Thomas',
            'Roberts', 'Khan', 'Lewis', 'Jackson', 'Clarke', 'James', 'Phillips', 'Wilson',
            'Ali', 'Mason', 'Mitchell', 'Rose', 'Davis', 'Davies', 'Rodriguez', 'Cox', 'Alexander'
        ]

        for i in range(len(first_names)):
            tmp_email = first_names[i].lower() + "." + last_names[i].lower() + "@example.com"
            tmp_pass = ''.join(random.choice(string.ascii_lowercase + string.digits) for i in range(10))
            user_datastore.create_user(
                first_name=first_names[i],
                last_name=last_names[i],
                email=tmp_email,
                password=encrypt_password(tmp_pass),
                roles=[user_role, ]
            )

        db.session.commit()


        for c in communities['community']:
            db.session.add(Community(code=c[0], name=c[1]))

        for district in districts:
            db.session.add(PoliceDistrict(id=district,
                                          name=districts[district]['name'],
                                          address=districts[district]['address'],
                                          zipcode=districts[district]['zipcode'],
                                          community=districts[district]['community'],
                                          patrols=districts[district]['patrols']))
            for c in communities['community']:
                api_key = 'mSK2RhhZ7WDv6OLxggkXESpwfzDZOPep'
                source = districts[district]['address'] + ", Chicago, IL, " + districts[district]['zipcode']
                destination = c[1] + ", Chicago, IL"
                payload = json.dumps({"locations": [source,destination]})
                url ='http://www.mapquestapi.com/directions/v2/routematrix?key='
                #r = requests.post(url + api_key, data=payload)
                #dist = r.json()['distance'][1]
                dist = 0
                db.session.add(Distance(name=districts[district]['name'] + ' to ' + c[1],
                                        district=district,
                                        community=c[0],
                                        distance=dist))


        db.session.commit()

    return

if __name__ == '__main__':

    ### Uncomment on first run to create/re-create sample database
    #build_db()

    # Start application
    application.run(debug=True)

// to define all the data types which are needed
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList, GraphQLSchema } = require('graphql');
const _ = require('lodash');

const Court = require('../models/courtModel');
const User = require('../models/userModel');
const SuperAdmin = require('../models/superAdminModel');
const CourtAdmin = require('../models/courtAdminModel');
const Booking = require('../models/bookingModel');
const CourtRegistration = require('../models/registrationModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'random#secret';
const validator = require('validator');

// Define Court type
const CourtType = new GraphQLObjectType({
    name: 'court',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        sportName: { type: GraphQLString },
        location: { type: GraphQLString },
        //connect between court and bookings
        bookings: {
            type: new GraphQLList(BookingType),
            resolve(parent, args) {
                return Booking.findAll({ where: { courtId: parent.id } });
            }
        }
    })
});

// Define User Type
const UserType = new GraphQLObjectType({
    name: 'user',
    fields: () => ({
        id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        phone: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        token: { type: GraphQLString },
         //connect between user and bookings
        bookings: {
            type: new GraphQLList(BookingType),
            resolve(parent, args) {
                return Booking.findAll({ where: { userId: parent.id } });
            }
        },
         //connect between user and registrations
        courtRegistrations: {
            type: new GraphQLList(RegistrationType),
            resolve(parent, args) {
                return CourtRegistration.findAll({ where: { userId: parent.id } });
            }
        }

    })
})

// Define Super Admin Type
const SuperAdminType = new GraphQLObjectType({
    name: 'superAdmin',
    fields: () => ({
        id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        phone: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        token: { type: GraphQLString }
    })
})

// Define Court Admin Type
const CourtAdminType = new GraphQLObjectType({
    name: 'courtAdmin',
    fields: () => ({
        id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        phone: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        token: { type: GraphQLString }
    })
})

// Define booking Type
const BookingType = new GraphQLObjectType({
    name: 'booking',
    fields: () => ({
        id: { type: GraphQLID },
        startTime: { type: GraphQLString },
        endTime: { type: GraphQLString },
        sportName: { type: GraphQLString },
        status: { type: GraphQLString },
         //connect between booking and user
        user: {
            type: UserType,
            resolve(parent, args) {
                return User.findByPk(parent.userId);
                
            }
        },
         //connect between booking and court
        court: {
            type: CourtType,
            resolve(parent, args) {
                return Court.findByPk(parent.courtId);
            }
        }
    })
})

// Define booking Type
const RegistrationType = new GraphQLObjectType({
    name: 'courtRegistration',
    fields: () => ({
        id: { type: GraphQLID },
        courtName: { type: GraphQLString },
        location: { type: GraphQLString },
        sportName: { type: GraphQLString },
        status: { type: GraphQLString },
         //connect between booking and user
        user: {
            type: UserType,
            resolve(parent, args) {
                return User.findByPk(parent.userId);
            }
        }
    })
})

// Define RootQuery
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        court: {
            type: CourtType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                console.log(typeof (args.id));
                return Court.findByPk(args.id)
            }
        },
        courts: {
            //list all courts
            type: new GraphQLList(CourtType),
            resolve(parent, args) {
                return Court.findAll();
            }
        },
        user: {
            type: UserType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                console.log(typeof (args.id));
                return User.findByPk(args.id);
            }
        },
        users: {
            //list all users
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return User.findAll();
            }
        },
        superAdmin: {
            type: SuperAdminType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return SuperAdmin.findByPk(args.id);
            }

        },
        courtAdmin: {
            type: CourtAdminType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return CourtAdmin.findByPk(args.id);
            }
        },
        booking: {
            type: BookingType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return Booking.findByPk(args.id);
            }
        },
        bookings: {
            //list all bookings
            type: new GraphQLList(BookingType),
            resolve(parent, args) {
                return Booking.findAll();
            }
        },
        courtRegistration: {
            type: RegistrationType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return CourtRegistration.findByPk(args.id);
            }
        },
        courtRegistrations: {
            //list all registrations
            type: new GraphQLList(RegistrationType),
            resolve(parent, args) {
                return CourtRegistration.findAll();
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        // Add Court Mutation
        addCourt: {
            type: CourtType,
            args: {
                name: { type: GraphQLString },
                sportName: { type: GraphQLString },
                location: { type: GraphQLString }
            },
            resolve(parent, args) {

                //create new court
                return Court.create({
                    name: args.name,
                    sportName: args.sportName,
                    location: args.location
                });
            }
        },

        // Delete Court Mutation
        deleteCourt: {
            type: CourtType,
            args: { id: { type: GraphQLID } },
            async resolve(parent, args) {
                //find the court by id
                const court = await Court.findByPk(args.id);
                //checks if the court exists
                if (!court) {
                    throw new Error('Court not found');
                }
                //delete court
                await Court.destroy({ where: { id: args.id } });
                return court;
            }
        },

        // Sign Up User Mutation
        signUpUser: {
            type: UserType,
            args: {
                firstName: { type: GraphQLString },
                lastName: { type: GraphQLString },
                phone: { type: GraphQLString },
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            async resolve(parent, args) {
                //check if the user already exists by email, email should be unique
                const existingUser = await User.findOne({ where: { email: args.email } });
                if (existingUser) throw new Error('Email already in use');

                //validating the email
                if (!validator.isEmail(args.email)) throw new Error('Please enter a valid email');

                //hashing the password
                const hashedPassword = await bcrypt.hash(args.password, 10);
                const newUser = await User.create({
                    firstName: args.firstName,
                    lastName: args.lastName,
                    phone: args.phone,
                    email: args.email,
                    password: hashedPassword
                });

                //generate token
                const token = jwt.sign({ userId: newUser.id, email: newUser.email }, SECRET_KEY);
                return { ...newUser.dataValues, token };
            }
        },

        // Login User Mutation
        loginUser: {
            type: UserType,
            args: {
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            async resolve(parent, { email, password }) {
                const user = await User.findOne({ where: { email } });

                //checks if the user exists
                if (!user) throw new Error('User does not exist');

                //compare the password
                const isPasswordCorrect = await bcrypt.compare(password, user.password);
                if (!isPasswordCorrect) throw new Error('Incorrect password');

                //generate token
                const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY);
                return { ...user.dataValues, token };
            }
        },

        // Sign Up SuperAdmin Mutation
        signUpSuperAdmin: {
            type: SuperAdminType,
            args: {
                firstName: { type: GraphQLString },
                lastName: { type: GraphQLString },
                phone: { type: GraphQLString },
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            async resolve(parent, args) {
                const existingSuperAdmin = await SuperAdmin.findOne({ where: { email: args.email } });
                if (existingSuperAdmin) throw new Error('Email already in use');
                if (!validator.isEmail(args.email)) throw new Error('Please enter a valid email');

                const hashedPassword = await bcrypt.hash(args.password, 10);
                const newSuperAdmin = await SuperAdmin.create({
                    firstName: args.firstName,
                    lastName: args.lastName,
                    phone: args.phone,
                    email: args.email,
                    password: hashedPassword
                });
                const token = jwt.sign({ superAdminId: newSuperAdmin.id, email: newSuperAdmin.email }, SECRET_KEY);
                return { ...newSuperAdmin.dataValues, token };
            }
        },

        // Login SuperAdmin Mutation
        loginSuperAdmin: {
            type: SuperAdminType,
            args: {
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            async resolve(parent, { email, password }) {
                const superAdmin = await SuperAdmin.findOne({ where: { email } });
                if (!superAdmin) throw new Error('Super Admin does not exist');

                const isPasswordCorrect = await bcrypt.compare(password, superAdmin.password);
                if (!isPasswordCorrect) throw new Error('Incorrect password');

                const token = jwt.sign({ superAdminId: superAdmin.id, email: superAdmin.email }, SECRET_KEY);
                return { ...superAdmin.dataValues, token };
            }
        },

        // Sign Up CourtAdmin Mutation
        signUpCourtAdmin: {
            type: CourtAdminType,
            args: {
                firstName: { type: GraphQLString },
                lastName: { type: GraphQLString },
                phone: { type: GraphQLString },
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            async resolve(parent, args) {
                const existingCourtAdmin = await CourtAdmin.findOne({ where: { email: args.email } });
                if (existingCourtAdmin) throw new Error('Email already in use');
                if (!validator.isEmail(args.email)) throw new Error('Please enter a valid email');

                const hashedPassword = await bcrypt.hash(args.password, 10);
                const newCourtAdmin = await CourtAdmin.create({
                    firstName: args.firstName,
                    lastName: args.lastName,
                    phone: args.phone,
                    email: args.email,
                    password: hashedPassword
                });
                const token = jwt.sign({ courtAdminId: newCourtAdmin.id, email: newCourtAdmin.email }, SECRET_KEY);
                return { ...newCourtAdmin.dataValues, token };
            }
        },

        // Login CourtAdmin Mutation
        loginCourtAdmin: {
            type: CourtAdminType,
            args: {
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            async resolve(parent, { email, password }) {
                const courtAdmin = await CourtAdmin.findOne({ where: { email } });
                if (!courtAdmin) throw new Error('Court Admin does not exist');

                const isPasswordCorrect = await bcrypt.compare(password, courtAdmin.password);
                if (!isPasswordCorrect) throw new Error('Incorrect password');

                const token = jwt.sign({ courtAdminId: courtAdmin.id, email: courtAdmin.email }, SECRET_KEY);
                return { ...courtAdmin.dataValues, token };
            }
        },

        // Add Booking Mutation
        addBooking: {
            type: BookingType,
            args: {
                startTime: { type: GraphQLString },
                endTime: { type: GraphQLString },
                sportName: { type: GraphQLString },
                status: { type: GraphQLString },
                userId: { type: GraphQLString },
                courtId: { type: GraphQLString }
            },
            resolve(parent, args) {
                //create new booking
                return Booking.create({
                    startTime: args.startTime,
                    endTime: args.endTime,
                    sportName: args.sportName,
                    status: args.status,
                    userId: args.userId,
                    courtId: args.courtId
                });
            }
        },

        // Delete Booking Mutation
        deleteBooking: {
            type: BookingType,
            args: { id: { type: GraphQLID } },
            async resolve(parent, args) {
                //check if the booking exists
                const booking = await Booking.findByPk(args.id);
                if (!booking) {
                    throw new Error('Booking not found');
                }

                //delete booking from db
                await Booking.destroy({ where: { id: args.id } });
                return booking;
            }
        },

        // Update Booking Status Mutation
        updateBookingStatus: {
            type: BookingType,
            args: {
                //id and status to update status
                id: { type: GraphQLID },
                status: { type: GraphQLString }
            },
            async resolve(parent, args) {
                //checks if the booking exists
                const booking = await Booking.findByPk(args.id);
                if (!booking) {
                    throw new Error('Booking not found');
                }
                booking.status = args.status;

                //update the status and store to db
                await booking.save();
                return booking;
            }
        },

        // Add Court Registration Mutation
        addCourtRegistration: {
            type: RegistrationType,
            args: {
                courtName: { type: GraphQLString },
                location: { type: GraphQLString },
                sportName: { type: GraphQLString },
                status: { type: GraphQLString },
                userId: { type: GraphQLString }
            },
            resolve(parent, args) {
                //create new registration
                return CourtRegistration.create({
                    courtName: args.courtName,
                    location: args.location,
                    sportName: args.sportName,
                    status: args.status,
                    userId: args.userId
                });
            }
        },

        // Delete Court Registration Mutation
        deleteCourtRegistration: {
            type: RegistrationType,
            args: { id: { type: GraphQLID } },
            async resolve(parent, args) {

                // checks if the registration exists
                const registration = await CourtRegistration.findByPk(args.id);
                if (!registration) {
                    throw new Error('Court Registration not found');
                }
                //delete court registration from db
                await CourtRegistration.destroy({ where: { id: args.id } });
                return registration;
            }
        },

        // Update Court Registration Status Mutation
        updateRegistrationStatus: {
            type: RegistrationType,
            args: {
                //id  and status to update registration status
                id: { type: GraphQLID },
                status: { type: GraphQLString }
            },
            async resolve(parent, args) {
                //check if the registration exists
                const registration = await CourtRegistration.findByPk(args.id);
                if (!registration) {
                    throw new Error('Registration not found');
                }
                //update the registration and store to db
                registration.status = args.status;
                await registration.save();
                return registration;
            }
        }
    }
});


// Export schema
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});

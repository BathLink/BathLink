## BathLink Backend

This is the backend for the Bathlink API. It comprises of an API with a database hosted with AWS.


### Databases

#### Users table
userId - key
gender
dob
phoneNumber
email
profile - {
    social - {type,value},
    description,
    pronouns
}
calendar
matchPreferences - {
    enabled
    activites - [
        {activity, frequency}
    ]
}


#### Meetups
meetupId
participants - [userId]
activity
startTime
endTime
done

#### GroupChats
chatId
meetupId
messages - [
    {
        userId
        content
        time
    }
]

#### Hobbies
name
potentialLocations

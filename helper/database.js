if (process.env.NODE_ENV === "production"){
    module.exports = {
        //  Connection to Cloud MongoDB Server
        mongoURI:"mongodb+srv://Johnnycashew:robbingTheRich4%24@cluster0-2blit.mongodb.net/test?retryWrites=true&w=majority"
    }
}
else{
    module.exports = {
        mongoURI:'mongodb://localhost:27017/gameLibrary'
    }
}

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens=async (userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})

        return {refreshToken,accessToken}


    } catch (error) {
        throw new Error(500,"Something went wrong while generating access and refresh token");
        
    }
}

const registerUser = asyncHandler(async(req,res)=>
    {
       const {name,email,password,phone}=req.body
       if([name,email,password].some((field)=>
        field?.trim()===""
       )){
        throw new ApiError (400,"All fields are required")
       }

       const existedUser= await User.findOne({email})
       if (existedUser) {
        throw new ApiError(409,"Email already exists");
        
       }
       const user = await User.create({
        name,
        email,
        password,
        phone
       })

       const createdUser = await User.findById(user._id).select("-password -refreshToken")
       if (!createdUser) {
        throw new ApiError(500,"Something went wrong while registering the user");
        
       }

       return res.status(201).json(
        new ApiResponse(200,createdUser,"User Created Successfully")
       )

    })

const loginUser=asyncHandler(async(req,res)=>{
    const {email,password}=req.body
    if (!email) {
        throw new ApiError(400,"Email is required")
    }
    const user= await User.findOne({
        $or:[{email}]
    })
    if (!user) {
        throw new ApiError(404,"User does not exist")
    }
    const isPassValid=await user.isPasswordCorrect(password)
    if(!isPassValid){
        throw new ApiError(401,"Invalid Credentials")
    }
    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")
     
    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
       new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User loggedIn Successfully"
        )
    )
})
const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {
                refreshToken: undefined
            }
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});


export {registerUser,
    loginUser,
    logoutUser
}